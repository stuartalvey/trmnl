# Alvey TRMNL Privacy Policy

Effective date: **November 12, 2026**.

## Who operates the app

Alvey TRMNL is a private household dashboard operated by **Stu Alvey**. It displays selected Oura information for adults who choose to connect their own accounts. It is not a public service, and it is not operated by or affiliated with Oura or TRMNL.

Privacy contact: participating household members can contact Stu Alvey directly through their existing private contact method. This app is only for invited adults who can reach the operator privately. Do not post health information or credentials in public GitHub issues.

## What information the app accesses

With your permission, the app reads information from the Oura V2 API using these permission categories:

- **Daily:** activity, readiness and sleep summaries, scores, contributors and detailed sleep records available through the authorized endpoints.

- **Heartrate:** heart-rate measurements and their timestamps.

- **Heart Health:** available cardiovascular-age and cardiovascular-fitness information, such as VO₂ max.

The app also uses the account connection, a display label chosen for the household dashboard, and the access and refresh tokens needed to retrieve authorized information. The initial configuration does not request Oura’s separate Email or Personal permission categories. Availability depends on your Oura account, ring, membership, synchronization and permissions.

You sign in directly with Oura. The dashboard does not ask you to give its operator your Oura password. Oura controls its sign-in and consent screens.

## Why the information is used

Information is used to show your selected daily measurements and recent trends, keep the dashboard current, and identify missing or outdated data. The app is not intended for diagnosis, treatment, emergencies, employment, insurance, lending or other eligibility decisions.

The app does not sell Oura information, use it for advertising, or provide its API-derived information to AI models. Automated AI analysis is not part of this connection. Any future AI feature would need a route permitted by Oura’s terms, as well as separate review and any required new user consent; consent alone does not override Oura’s API restrictions.

## Where information goes and who can see it

When authorized, the connection sends authorized information from Oura to the private plugin hosted by TRMNL, where it is processed into dashboard data and screen images for the selected household TRMNL device. The household TRMNL account administrator can access the connection and its data. Each person must expressly agree before their information is made visible to another household member.

A physical display is not an authenticated personal screen. Anyone who can see it, including a visitor, may see the information shown. Connect only if you agree to the selected display’s location and audience. An ePaper screen can retain its last image even after connectivity or power is removed.

TRMNL and its service providers process information needed to operate the hosted connection and display. Their handling is described in [TRMNL’s privacy policy](https://trmnl.com/privacy). Oura’s handling of the source account is covered by [Oura’s privacy policy](https://ouraring.com/privacy-policy).

The public project repository and any public policy pages are for code and documentation, not Oura records, tokens, credentials or screenshots containing personal health information. These policy pages are hosted on GitHub, which may process ordinary visit information under its [privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

## Storage and retention

When connected, the app requests a rolling seven-day window of daily and main-sleep records, a trailing 24-hour window of heart-rate samples, and a 30-day window to find the most recent cardiovascular-age and VO₂-max measurements. The application code creates a compact display snapshot, not a separate historical database or unrestricted export of your Oura account. The displayed window is not a guarantee that every source returns complete history.

TRMNL hosts the account connection, fetched responses, processed display data and rendered screen images. OAuth tokens are used while the account remains connected and access is permitted; their validity and refresh are controlled by Oura and TRMNL. Raw-response, processed-data and token-copy retention within TRMNL has not been independently verified for this connection. The app does not promise immediate destruction of a prior snapshot merely because the next refresh replaces the displayed values.

TRMNL currently states that third-party credentials are encrypted at rest, that it keeps the most recent screens, that operational/security logs are retained for seven days, and that deleted database data may remain in backups for up to seven days. These are TRMNL’s published practices, not an app-specific guarantee of earlier backup erasure. See [TRMNL’s privacy policy](https://trmnl.com/privacy) for its current practices.

## Your choices and deletion

Connecting is optional. Each person authorizes only their own account and may decline or withdraw permission. You can revoke the app’s access through Oura’s account authorization controls and contact the operator to stop dashboard use, request access to the app’s retained information, or request deletion. Revocation and deletion of a dashboard copy do not delete your original records at Oura.

The operator must stop processing when you opt out or revoke consent. Revocation alone does not erase a previously rendered image, so the dashboard copy and the physical display must also be cleared or replaced.

To request removal, contact the operator privately. The removal process is to stop the app’s polling and display use, revoke the Oura authorization, remove the affected TRMNL connection and its retained dashboard data/screens, and clear or replace the last image on the household device. The operator will confirm the actions actually completed and identify any remaining provider-managed copies. Oura’s API agreement imposes a 72-hour deletion obligation after a deletion request; this policy does not waive that obligation or represent that TRMNL’s backup retention has been overridden. Revocation, active-service deletion and eventual provider-backup expiry are different events.

## Security and changes

The connection is designed to use Oura OAuth and HTTPS, keep each account’s authorization separate, limit access to the authorized household configuration, and exclude secrets and health records from public code. No system or physical screen can provide absolute security.

The operator will update this policy before a material change in purpose, access or recipients. New uses of previously collected information will not be treated as authorized merely because this policy changes. For questions or a privacy request, contact the operator privately as described above.

Related: [Terms of Use](oura-terms.md).
