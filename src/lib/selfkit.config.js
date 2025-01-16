export const config = Object.freeze({
    /**
     * The domain of your SAAS (only used in production), it's mainly used for authentication process
     * NOTE : If the host do not match the real one, authentication will failed
    */
    host: "mysaas.com",
    // ------------------ APP INFORMATION ------------------------ 
    appName: "Mysaas",
    appDescription: "A description for my SAAS",
    appUrl: "https://www.mysaas.com",
    appKeywords: ["SAAS", "Boilerplate", "Svelte", "Self hosted"], // Primarily used for SEO, these are included in the meta tags of every page, alongside any you add manually in +page.server.ts.
    appCategory: "website",
    appOS: "Web, Android, IOS",
    // ------------------ OWNER INFORMATION ------------------------ 
    // The owner can be you as an individual or a company (depending of your status)
    ownerFullName: "John Doe",
    ownerEmail: "john.doe@mail.com",
    ownerTelephone: "0123456789",
    ownerAddress: "1200 Sunset Ave, somewhere, 12345 Somecity",
    ownerCountry: "Some country",
    ownerCity: "Somecity",
    // ------------------ PRODUCT INFORMATION ------------------------ 
    productDescription: "A super product to help people",
    // ------------------ EMAILS ------------------------ 
    /**
     *  Email used for automatic email (i.e. sending verification code)
     *  You can use the same email as support or contact
     */
    emailNoreply: "no-reply@mysaas.com",
    /**
     *  Email used for receiving email regarding technical issues, this email is displayed on the error page
     *  You can use the same email as noreply or contact
     */
    emailSupport: "support@mysaas.com",
    /**
     *  Email used for receiving email for contact (used in contact page)
     *  You can use the same email as noreply or support
     */
    emailContact: "contact@mysaas.com",
    // ------------------ LEGALS ------------------------
    lastTermsUpdate: "01/01/2025",
    minimumLegalAge: "16",
    serviceDescription: "A boilerplate for building SAAS product.",
    priceChangePeriod: "30",
    termsChangePeriod: "30",
    refundsPeriod: "14",
    refundsProcessPeriod: "7",
    privacyRequestProcess: "30",
    // ------------------ SEO ------------------------
    /** 
     * Default image shown via OpenGraph
     */
    defaultSeoImageUrl: "https://mysaas.com/mysaas.png",
    /** 
     * Facebook app id use to enable Facebook Insights, more information here https://developers.facebook.com/docs/sharing/webmasters/
     * If empty, Facebook insights is disable.
    */
    seoFacebookAppId: "",
    /**
     * Required to enable twitter summary card, more information here https://developer.x.com/en/docs/x-for-websites/cards/overview/summary
     * If empty, twitter summary card is disable.
     */
    seoTwitterCreator: "",
    seoTwitterImage: "",
    seoTwitterAlt: "",

    // ------------------ PAYMENT ------------------------ 
    /**
     * - If True, the user can subscribed on multiple product,
     * in the payment page: a message is shown if he is already subscribed to a specific product
     * 
     * - If False, the other product are considered as a downgrade or upgrade of the current subscription,
     * in the payment page the user is redirected to his profile to manage the subscription and a button to change plan is shown
     */
    enableMultiSubscription: false,

    /**
     * - If True, the user can switch his subscription from annually to monthly, a proration will be applied as a credit in paddle for next purchases.
     * you can change the proration billing mode in the [Page server Account](../routes/account/+page.server.ts)
     * 
     * - If False, the change billing button will not appear if the subscription has a "yearly" billing period.
     * Also, if the user want to change his plan, only product variant with same billing period will be shown
     * 
     * In both case, no button appear if the subscription is a one time payment.
     */
    enableAnnuallyToMonthlyBilling: false,

    // ------------------ AUTHENTICATION ------------------------ 
    /**
     * - If True, user can use passkey for 2FA authentication
     * 
     * - If False, user do not have the possibility to use passkey for 2FA authentication*
     * 
     * Note: With passkey enabled, users can authenticate with digital credential like fingerprint or facial recognition
     */
    enablePasskeyAuth: true,
    /**
     * - If True, user can use securityKey for 2FA authentication
     * 
     * - If False, user do not have the possibility to use securityKey for 2FA authentication
     * 
     * Note: With securityKey enabled, users can authenticate with physical device like Google Titan security key, YubiKey, etc...
     */
    enableSecurityKeyAuth: true,
        /**
     * - If True, user can use TOTP for 2FA authentication
     * 
     * - If False, user do not have the possibility to use TOTP for 2FA authentication
     * 
     * Note: With TOTP enabled, users can authenticate with App like Google Authenticator, Microsoft Authenticator, etc...
     */
    enableTotpAuth: true,
});