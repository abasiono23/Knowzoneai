# Google Play Billing: setup guide for the owner

The Android app now sells Knowzone Plus and Pro through **Google Play** (Google requires this for subscriptions
inside Play apps). The website (app.knowzoneai.com) keeps **Flutterwave**. Either way the plan lands on the same
Knowzone account.

The code is finished. What is left is setup that only you can do, because it needs your Google accounts.
Work through the parts in order. Allow about two hours, plus up to a day of waiting for Google in Part 4.

**Words used below**

- **Play Console**: the website where you manage the Android app, https://play.google.com/console
- **Google Cloud Console**: a separate Google website for technical settings, https://console.cloud.google.com
- **Service account**: a robot Google account that our server uses to ask Google "is this purchase real?"
- **Render**: where the Knowzone server runs. "Environment variables" are its private settings.
- **Base plan**: Google's name for one way of paying for a subscription (monthly, every 3 months, yearly).

Google moves its menus around now and then. If a menu isn't exactly where this guide says, use the search box at
the top of the console and type the name in bold.

---

## The products (must match the code exactly)

Two subscriptions, each with three base plans. Type the IDs exactly as shown: lower case, no spaces.
**IDs can never be changed or reused once created**, so check them twice.

| Subscription (Product ID) | Base plan ID | Bills every | Price in Nigeria | Suggested US price |
| --- | --- | --- | --- | --- |
| `knowzone_plus` | `monthly` | 1 month | ₦5,000 | $3.99 |
| `knowzone_plus` | `term` | 3 months | ₦13,000 | $10.49 |
| `knowzone_plus` | `yearly` | 1 year | ₦43,000 | $34.49 |
| `knowzone_pro` | `monthly` | 1 month | ₦9,000 | $7.49 |
| `knowzone_pro` | `term` | 3 months | ₦23,500 | $18.99 |
| `knowzone_pro` | `yearly` | 1 year | ₦77,000 | $61.49 |

The app's package name (its unique ID on Google Play) is `ai.knowzone.app`.

---

## Part 1. Payments profile (so Google can pay you)

1. Open Play Console and sign in with the account that owns the app.
2. In the left menu choose **Setup → Payments profile** (if you don't see it, open **Settings** at account level).
3. Click **Create payments profile**. Enter the legal business name, address and contact details.
4. Add the **bank account** Google should pay into, and complete any identity or tax forms it asks for.
5. Wait until the page shows the profile as active. You cannot create paid products before this.

Good to know: Google keeps a service fee from each subscription payment (normally 15%) and handles the sales tax
for most countries itself.

## Part 2. Upload a build that contains billing

Play Console only unlocks the Subscriptions page after it has received a build of the app that includes the
billing library. The new code adds it.

1. Ask your engineer to make a new Android **App Bundle (.aab)** from the current code. An over-the-air update is
   not enough, because billing is native code. (Note for the engineer: `codemagic.yaml` currently builds an APK with
   `assembleRelease`; Play needs `bundleRelease`.)
2. In Play Console open the app, then **Test and release → Testing → Internal testing**.
3. Click **Create new release**, upload the `.aab`, give it a name, then **Save** and **Start rollout to Internal
   testing**.

## Part 3. Create the two subscriptions

Do steps 1 to 12 for `knowzone_plus`, then again for `knowzone_pro`.

1. In Play Console open the app, then **Monetize with Play → Products → Subscriptions**.
2. Click **Create subscription**.
3. **Product ID**: `knowzone_plus`. **Name**: `Knowzone Plus`. Click **Create**.
4. (Optional) Under **Subscription details** add the benefits that Google shows on its own screens, for example
   "100 AI tutor questions a day" and "60 AI credits every month".
5. Click **Add base plan**.
6. **Base plan ID**: `monthly`.
7. **Type**: **Auto-renewing**. **Billing period**: **Monthly**.
8. Leave **Grace period** and **Account hold** on Google's defaults. (Grace period means that if a renewal payment
   fails, the learner keeps the plan for a few days while Google retries. The app handles this.)
9. Click **Set prices** (or **Manage country/region availability**), select **all countries**, and set the price:
   - Find **Nigeria** and enter the price so that the amount **the buyer pays** is ₦5,000. Play Console shows two
     columns, one before tax and one that the buyer pays. It is the buyer's column that should read ₦5,000.
   - For every other country, the simplest choice is to let Google convert: select the remaining countries, click
     **Set price**, enter the US price from the table above (for example 3.99 USD), and Google fills in each
     country's local price. You can adjust any country later.
10. Click **Save**, then **Activate**. A base plan that is not activated cannot be bought.
11. Click **Add base plan** again for `term`: **Billing period: Every 3 months**, price ₦13,000 (US $10.49).
    Save and activate.
12. Click **Add base plan** again for `yearly`: **Billing period: Yearly**, price ₦43,000 (US $34.49).
    Save and activate.

Then create the second subscription: **Product ID** `knowzone_pro`, **Name** `Knowzone Pro`, with base plans
`monthly` ₦9,000 ($7.49), `term` ₦23,500 ($18.99) and `yearly` ₦77,000 ($61.49).

Please do **not** add "offers" (free trials, introductory prices) yet. The app currently sells the plain base
plans only. Tell your engineer first if you want a free trial.

If you later change a price in Play Console, also tell your engineer: the website's prices are set in the code,
and the two should match.

## Part 4. Let the server talk to Google (service account)

This creates the robot account and gives it permission to read purchases for the app.

**In Google Cloud Console**

1. Open https://console.cloud.google.com and sign in with the same Google account.
2. At the top, click the project picker, then **New project**. Name it `Knowzone Play` and click **Create**. Make
   sure it is the selected project afterwards.
3. In the search box type **Google Play Android Developer API**, open it, and click **Enable**.
4. In the left menu choose **IAM & Admin → Service accounts**, then **Create service account**.
5. **Name**: `knowzone-play-billing`. Click **Create and continue**, skip the optional steps, click **Done**.
6. In the list you will now see an address that looks like
   `knowzone-play-billing@knowzone-play-123456.iam.gserviceaccount.com`. **Copy this address.**
7. Click that service account, open the **Keys** tab, then **Add key → Create new key → JSON → Create**. A `.json`
   file downloads. **This file is a password. Don't email it, don't put it in the code, and keep one safe copy.**

**In Play Console**

8. Open **Users and permissions** (left menu, account level), then **Invite new users**.
9. **Email address**: paste the service account address from step 6.
10. Under **App permissions** click **Add app**, choose **Knowzone AI**, and tick these two permissions:
    - **View financial data, orders, and cancellation survey responses**
    - **Manage orders and subscriptions**
11. Click **Invite user**, then **Send invitation**. The robot account appears in the list as active.

Google can take **up to 24 hours** before this permission starts working. If purchases fail to confirm on the
first day with a "permission" error in the server log, wait and try again. (A known trick that often speeds it
up: open one subscription in Play Console, change its description slightly and save.)

## Part 5. Real-time notifications (so renewals and cancellations reach us)

Google tells our server at once when a subscription renews, is cancelled, fails to pay, is refunded or ends. It
does this through a Google Cloud service called **Pub/Sub** (a message pipe): Google Play puts a message in a
"topic", and a "subscription" on that topic forwards it to our server.

1. **Make a secret.** Create a long random password of letters and numbers only (at least 40 characters, no
   symbols or spaces). A password manager can generate one. Keep it for step 6 and for Part 6.
2. In Google Cloud Console (project `Knowzone Play`), search for **Pub/Sub** and open **Topics**.
3. Click **Create topic**. **Topic ID**: `play-billing`. Untick **Add a default subscription**. Click **Create**.
4. On the topic page open the **Permissions** panel on the right (click **Show info panel** if it is hidden), then
   **Add principal**:
   - **New principals**: `google-play-developer-notifications@system.gserviceaccount.com`
   - **Role**: **Pub/Sub Publisher**
   - Click **Save**. (This allows Google Play to put messages into the topic.)
5. Still on the topic page, click **Create subscription** (or **Subscriptions → Create subscription**).
6. Fill it in:
   - **Subscription ID**: `play-billing-push`
   - **Delivery type**: **Push**
   - **Endpoint URL**: `https://YOUR-SERVER-ADDRESS/webhooks/google-play?token=YOUR-SECRET`
     Replace `YOUR-SERVER-ADDRESS` with the server's address on Render (the same address the Flutterwave webhook
     uses) and `YOUR-SECRET` with the secret from step 1.
   - Leave **Enable authentication** off (the secret in the address does this job).
   - **Subscription expiration**: **Never expire**.
   - **Acknowledgement deadline**: `30` seconds.
   - **Retry policy**: **Retry after exponential backoff delay**.
   - Click **Create**.
7. Go back to the **Topics** list and copy the full **topic name**. It looks like
   `projects/knowzone-play-123456/topics/play-billing`.
8. In Play Console open the app, then **Monetize with Play → Monetization setup**.
9. Under **Real-time developer notifications**, tick **Enable real-time notifications**, paste the topic name,
   and for **Notification content** choose **Subscriptions, voided purchases, and all one-time products**.
10. Click **Save changes**. Do Part 6 first, then come back and click **Send test notification**: Play Console
    should say the test was sent, and in Pub/Sub the subscription's graph should show the message delivered with
    no errors.

## Part 6. Server settings on Render

1. Open https://dashboard.render.com, choose the service **knowzone-api**, then **Environment**.
2. Add these variables:

   | Key | Value |
   | --- | --- |
   | `GOOGLE_PLAY_SERVICE_ACCOUNT` | The **whole content** of the `.json` file from Part 4 step 7. Open the file in Notepad, select all, copy, paste. |
   | `GOOGLE_PLAY_WEBHOOK_SECRET` | The secret from Part 5 step 1 (exactly the same text as in the endpoint URL). |
   | `GOOGLE_PLAY_PACKAGE` | `ai.knowzone.app` (optional: this is already the default). |

3. Click **Save changes**. Render restarts the server by itself.

If Render complains about the multi-line value, your engineer can turn the file into one line of base64 text
instead; the server accepts both.

## Part 7. Update the database (one command)

The server needs two new columns and one new table. In PowerShell, from the `apps\server` folder, run:

```powershell
$u = (Select-String -Path .env -Pattern '^DATABASE_URL=(.*)$').Matches[0].Groups[1].Value.Trim().Trim('"', "'")
$env:DATABASE_URL = if ($u -match '\?') { "${u}&connect_timeout=30" } else { "${u}?connect_timeout=30" }
npx prisma migrate deploy
Remove-Item Env:DATABASE_URL
```

It should report that `20261113120000_google_play` was applied. **Do this before (or right when) the new server
code goes live**, because the new code expects the new columns. It is safe for existing subscribers: every
existing plan and payment is simply marked as a Flutterwave one.

## Part 8. Test without spending money

1. In Play Console (account level) open **Setup → License testing**.
2. Add the Gmail addresses of your testers (including your own) and set **License response** to
   **RESPOND_NORMALLY**. Save. Licence testers pay with pretend cards and are never charged.
3. Open the app, then **Test and release → Testing → Internal testing → Testers**. Create an email list with the
   same Gmail addresses, save, and copy the **opt-in link** ("Join on the web").
4. On an Android phone signed in to Google Play with a tester's Gmail, open the opt-in link, accept, and install
   Knowzone from Google Play (not from a file sent by chat: purchases only work on a Play-installed copy).
5. Sign in to Knowzone, open **Plans**, and check each of these:
   - The prices shown are the ones you set in Play Console.
   - Buy **Plus monthly** with "Test card, always approves". The app should show the welcome screen, the plan
     should be Plus, and 60 AI credits should be added.
   - **Subscription** screen: it says Google Play, and **Cancel** opens Google Play's page.
   - Test subscriptions renew very fast (a "month" lasts about 5 minutes, and they stop after a few renewals).
     After a renewal, **Billing history** should show a second receipt.
   - Cancel in Google Play. The app should show the plan as cancelled, with access until the end date, and later
     move to Free.
   - Upgrade Plus to Pro from the Plans screen. Google should show a "change subscription" sheet, not a second
     subscription.
   - Uninstall and reinstall the app, sign in, then **Restore purchases**: the plan comes back.
   - Sign in to a different Knowzone account on the same phone and try **Restore purchases**: it should say the
     subscription belongs to another account.
   - Try "Test card, always declines": the app should say the purchase didn't go through.
   - Open the website with the same Knowzone account: it shows the same plan.

## Part 9. Going live

1. When testing passes, promote the release to **Production** in Play Console and complete any forms Play asks
   for (store listing, Data safety, content rating).
2. While the dashboard's **"everything free"** switch is on, learners already have every feature, so few will
   buy. Turn it off in the staff dashboard when you are ready to sell plans. Nothing in this work changed how
   that switch behaves.
3. Refunds for Google Play purchases are given in Play Console (**Order management**: find the order, **Refund**,
   and choose to also remove the subscription). The app updates by itself once Google tells the server.

## How it behaves, in short

- **Android app**: plans are bought, renewed, changed and cancelled through Google Play. Knowzone promo codes are
  not offered there, because Google sets the price. Learners can redeem Google Play's own codes in the Play Store
  and then tap **Restore purchases** in the app.
- **Website**: unchanged. Card, bank transfer and USSD through Flutterwave, prepaid, with promo codes.
- **One account, one plan**: a learner who buys on the phone has the plan on the website too, and the other way
  round. A learner who already has a prepaid plan from the website and then subscribes in the Android app is told
  that the new subscription replaces it.
- **iPhone**: not built yet. The code has a clear place for it when you are ready.

## If something goes wrong

| What you see | Likely cause |
| --- | --- |
| The Subscriptions page in Play Console is locked | No build with billing has been uploaded yet (Part 2), or the payments profile isn't active (Part 1). |
| The app shows our own prices, and buying says "This plan isn't available on Google Play yet" | The products or base plans aren't activated, an ID is misspelled, or the app wasn't installed from Google Play with a tester account. |
| Payment succeeds in Google Play but the app says it couldn't confirm it | The server can't reach Google: `GOOGLE_PLAY_SERVICE_ACCOUNT` is missing or wrong, the Play Developer API isn't enabled, or the permission from Part 4 is still spreading (wait up to a day). The learner is not charged twice; tapping **Try again** or **Restore purchases** later fixes it, and Google's notification unlocks the plan by itself once the server can reach Google. |
| Renewals and cancellations don't show up in the app | Part 5: the endpoint URL or the secret is wrong (the server answers 401), or the Pub/Sub Publisher permission is missing. The server also rechecks with Google every hour when a plan reaches its end date, so nobody loses a plan they paid for. |
| "Send test notification" shows an error | The topic name is mistyped, or step 4 of Part 5 (the Publisher permission) was skipped. |
