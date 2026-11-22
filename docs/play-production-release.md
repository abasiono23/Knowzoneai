# Releasing Knowzone AI to everyone on Google Play (Production)

This guide takes the app from internal testing to the public Production track. Parts 1 and 2 are done once, in
Play Console and Codemagic. Part 3 is what you do for every release after that.

---

## Part 1. Check that Google lets you publish to Production

1. Open [Play Console](https://play.google.com/console), choose **Knowzone AI**, and open the **Dashboard**.
2. Look for a section called **Apply for production access** or **Set up a closed test**.
   - **If you see it**, your developer account is a *personal* account made after 13 November 2023. Google then
     requires a **closed test** (not internal testing) before Production:
     1. Go to **Test and release → Testing → Closed testing**, create a track and upload the same app bundle.
     2. Add **at least 12 testers** (an email list), share the opt-in link, and have each of them accept it.
     3. Keep at least 12 testers opted in for **14 days in a row**.
     4. Then press **Apply for production** on the Dashboard and answer Google's questions about the test.
        Google usually replies within a week.
   - **If you don't see it** (an organisation account, or an older personal account), go straight to Part 2.

Internal testing does not count towards the 14 days.

## Part 2. One-time setup

### 2a. Finish the app's Play Console pages

In Play Console, open **Dashboard → Finish setting up your app** and complete every item. The answers for
Knowzone:

| Item | What to enter |
|---|---|
| Privacy policy | `https://www.knowzoneai.com/privacy` |
| App access | "Some functionality is restricted". Give a working test account (email and password) so Google's reviewers can sign in. |
| Ads | No ads |
| Content rating | Fill in the questionnaire: an education app with user chat (study rooms, AI tutor). |
| Target audience | 13 and over (secondary school, university and adult learners). Choosing under 13 brings in the stricter Families rules. |
| Data safety | Collected: name, email, learning activity, photos and files the student uploads, voice (if they use "Hey Kora"), purchase history. Encrypted in transit; users can ask for deletion. |
| Data deletion | A web link that tells people how to delete their account and data without the app, for example the privacy page's section on deleting your account. |
| Government app / financial features / health | No |
| Store listing | App name, short and full description, the 512 × 512 icon, a 1024 × 500 feature graphic and at least 2 phone screenshots. The ad images in `Downloads\knowzone-ads` can help with the graphic. |

### 2b. Codemagic: the signing key

1. Codemagic → **Team settings → Code signing identities → Android keystores → Add keystore**.
2. Upload the **upload key** you used to sign the internal-testing bundle, and set the reference name to
   exactly **`knowzone_keystore`**.
3. If you don't have that key file, stop and check Play Console → **Test and release → Setup → App signing**
   before going further. A different key will be rejected.

### 2c. Codemagic: let it upload to Google Play

1. In Google Cloud (the same project as the billing service account, see `docs/play-billing-setup.md` Part 4),
   create a **new service account**, for example `knowzone-releases`, and download its **JSON key**.
2. Play Console → **Users and permissions → Invite new users**. Paste the service account's email and give it,
   for Knowzone AI, **Release apps to production, exclude devices, and use Play App Signing** and
   **Release to testing tracks**. Send the invitation.
3. Codemagic → **Team settings → Global variables and secrets**. Create a group named **`google_play`** with one
   variable, **`GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`**: paste the whole JSON file as its value and tick **Secret**.

## Part 3. Each release

1. Make sure the code you want to release is on `main`.
2. Start the release with a version tag. In a terminal in the project folder:

   ```
   git tag v1.0.1
   git push origin v1.0.1
   ```

   Use a higher number each time: v1.0.2, v1.1.0 and so on. (Or in Codemagic choose **Start new build →
   Knowzone AI · Google Play release** and pick the tag.)
3. Codemagic runs the checks, builds the signed app bundle, gives it a version code higher than any before,
   and uploads it to the **Production** track as a **draft**. You get an email.
4. In Play Console open **Test and release → Production**. Check the draft (release notes, the countries it goes
   to), then press **Next → Start rollout to Production**.
   - For a careful first launch, choose a **staged rollout** (for example 20% of users), then raise it to 100%
     after a day or two if nothing goes wrong.
5. Google reviews the release. The first review can take several days; later ones are usually faster.

## If something goes wrong

| Problem | What to do |
|---|---|
| Build stops at "No Codemagic keystore" | The keystore isn't uploaded as `knowzone_keystore` (Part 2b). |
| "Version code has already been used" | Push a new tag. Each Codemagic build gets a new, higher code automatically. |
| "The caller does not have permission" | The service account hasn't accepted its Play Console invitation, or lacks the release permissions (Part 2c). |
| "Upload key does not match" | The keystore in Codemagic isn't the upload key Play expects (Part 2b, step 3). |
| Production track is greyed out | Production access hasn't been granted yet (Part 1). |
