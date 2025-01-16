<script>
	import { config } from "$lib/selfkit.config";

</script>
<div class="p-6">
    <h1>Privacy Policy</h1>
    <p>Effective Date: {new Date().toDateString()}</p>

    <p>{config.appName} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, <strong>{config.appUrl}</strong> or use our services. By accessing or using our services, you agree to the practices described in this Privacy Policy.</p>

    <hr>

    <h2>1. Information We Collect</h2>
    <h3>1.1 Personal Information</h3>
    <p>We may collect the following personal information directly from you:</p>
    <ul>
        <li>Email address (required for communication and login)</li>
        <li>Billing information (e.g., credit card details, address)</li>
        <li>Account details (e.g., email, encrypted password)</li>
    </ul>

    <h3>1.2 Automatically Collected Information</h3>
    <p>When you use our services, we may automatically collect:</p>
    <ul>
        <li>IP address</li>
        <li>Browser type and version</li>
        <li>Device information</li>
        <li>Usage data (e.g., pages visited, actions performed)</li>
    </ul>
    <p>This information is collected via cookies, analytics tools, and server logs to enhance user experience and improve our services. Compliant to GDPR and PECR</p>

    <h2>2. How We Use Your Information</h2>
    <p>We use your information for the following purposes:</p>
    <ul>
        <li>To provide, maintain, and improve our services.</li>
        <li>To process transactions and manage subscriptions.</li>
        <li>To send account-related communications (e.g., confirmations, updates, and security alerts).</li>
        <li>To respond to customer service inquiries and provide technical support.</li>
        <li>To comply with legal obligations.</li>
        <li>To analyze usage patterns and optimize user experience.</li>
    </ul>
    <p>We rely on legal bases for processing your data, including consent, contract execution, legal compliance, and legitimate interests.</p>

    <h2>3. How We Share Your Information</h2>
    <p>We do not sell your personal information. However, we may share your data in the following cases:</p>
    <h3>3.1 Service Providers</h3>
    <p>We may share your information with trusted third parties who perform services on our behalf, such as:</p>
    <ul>
        <li>Payment processors (e.g., Paddle)</li>
        <li>Hosting and cloud providers</li>
        <li>Analytics providers</li>
    </ul>
    <p>These providers are contractually obligated to protect your data and use it solely for the services they provide.</p>
    <h3>3.2 Legal Requirements</h3>
    <p>We may disclose your information when required by law, subpoena, or other legal processes, or to protect our legal rights.</p>
    <h3>3.3 Business Transfers</h3>
    <p>In the event of a merger, acquisition, or sale of assets, your data may be transferred to the new entity, subject to the terms of this Privacy Policy.</p>
    <h3>3.4 International Transfers</h3>
    <p>If your data is transferred outside the European Economic Area (EEA), we ensure appropriate safeguards, such as Standard Contractual Clauses, are in place to protect your information.</p>

    <h2>4. Your Data Rights</h2>
    <h3>4.1 Under the General Data Protection Regulation (GDPR)</h3>
    <p>If you are located in the European Economic Area (EEA), you have the following rights:</p>
    <ul>
        <li><strong>Access:</strong> Request a copy of your personal data.</li>
        <li><strong>Rectification:</strong> Correct any inaccuracies in your personal data.</li>
        <li><strong>Deletion:</strong> Request the deletion of your personal data.</li>
        <li><strong>Portability:</strong> Receive your data in a machine-readable format and transfer it to another service.</li>
        <li><strong>Objection:</strong> Object to the processing of your data in certain cases.</li>
        <li><strong>Withdraw Consent:</strong> Revoke consent where processing is based on consent.</li>
    </ul>

    <h3>4.2 Under the California Consumer Privacy Act (CCPA)</h3>
    <p>If you are a California resident, you have the following rights:</p>
    <ul>
        <li><strong>Access:</strong> Request details of the personal information we collect, use, and share.</li>
        <li><strong>Deletion:</strong> Request the deletion of your personal information.</li>
        <li><strong>Opt-Out:</strong> Opt out of the sale of personal information (note: we do not sell personal information).</li>
    </ul>
    <p>To exercise your rights, please contact us at <a href="mailto:{config.emailContact}">{config.emailContact}</a>. We will respond to verified requests within {config.privacyRequestProcess} days.</p>

    <h2>5. Data Retention</h2>
    <p>We retain your personal data only as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, or resolve disputes. For inactive accounts, data is deleted after three years unless otherwise required by law.</p>

    <h2>6. Security of Your Information</h2>
    <p>We implement industry-standard measures to protect your personal data, including:</p>
    <ul>
        <li>Encryption of data in transit using SSL technology</li>
        <li>Secure storage with restricted access</li>
        <li>Regular security audits</li>
    </ul>
    <p>However, no method of transmission over the Internet or electronic storage is 100% secure.</p>

    <h2>7. Cookies and Tracking Technologies</h2>
    <p>We use cookies and similar technologies to enhance your browsing experience. These include:</p>
    <ul>
        <li><strong>Necessary Cookies:</strong> Essential for the operation of our website.</li>
        <li><strong>Analytics Cookies:</strong> Help us analyze usage patterns and improve performance.</li>
    </ul>

    <h2>8. Third-Party Links</h2>
    <p>Our website may contain links to third-party websites. We are not responsible for their content or privacy practices. Please review their privacy policies before providing personal information.</p>

    <h2>9. Changes to This Privacy Policy</h2>
    <p>We reserve the right to update this Privacy Policy from time to time. For significant changes, we will notify you via email or a prominent notice on our website at least {config.termsChangePeriod} days in advance. Continued use of our services constitutes acceptance of the updated policy.</p>

    <h2>10. Contact Us</h2>
    <p>If you have questions or concerns about this policy, please contact us at:</p>
    <ul>
        <li>Email: <a href="mailto:{config.emailContact}">{config.emailContact}</a></li>
        <li>Address: {config.ownerAddress}</li>
    </ul>
    <p>By using SelfKit, you confirm that you have read, understood, and agree to this Privacy Policy.</p>
</div>

<style>
    h1 {
        @apply text-2xl font-bold
    }
    h2 {
        @apply text-xl font-bold pt-3
    }
    h3 {
        @apply text-lg font-semibold pt-2 
    }
    p {
        @apply py-2
    }
    ul {
        @apply list-disc list-inside
    }
    a {
        @apply underline hover:font-bold
    }
</style>