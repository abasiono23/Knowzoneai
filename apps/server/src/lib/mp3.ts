/**
 * Length of an MP3 in seconds, by walking its frame headers (MPEG-1/2/2.5 Layer III). Used to time
 * each video scene to its narration so captions stay in sync. Returns 0 if no frames are found.
 */
const BITRATES = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};
const SAMPLE_RATES: Record<number, number[]> = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

export function mp3Seconds(buf: Uint8Array): number {
  let i = 0;
  // Skip an ID3v2 tag: "ID3", 2 version bytes, flags, then a 4-byte syncsafe size.
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33 && buf.length > 10)
    i = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);

  let seconds = 0;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) {
      i++;
      continue;
    }
    const version = (buf[i + 1] >> 3) & 0x03; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
    const layer = (buf[i + 1] >> 1) & 0x03; // 1 = Layer III
    const bitrateIndex = (buf[i + 2] >> 4) & 0x0f;
    const rateIndex = (buf[i + 2] >> 2) & 0x03;
    const padding = (buf[i + 2] >> 1) & 0x01;
    if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) {
      i++;
      continue;
    }
    const bitrate = BITRATES[version === 3 ? 1 : 2][bitrateIndex] * 1000;
    const sampleRate = SAMPLE_RATES[version][rateIndex];
    const samples = version === 3 ? 1152 : 576;
    const length = Math.floor(((samples / 8) * bitrate) / sampleRate) + padding;
    if (length < 4) {
      i++;
      continue;
    }
    seconds += samples / sampleRate;
    i += length;
  }
  return seconds;
}
