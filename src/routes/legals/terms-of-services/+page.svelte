<script>
	import { config } from "$lib/selfkit.config";

</script>

<div class="p-6">
    <h1>Terms of Service</h1>
    <p>Last updated: {config.lastTermsUpdate}</p>

    <p>Welcome to <strong>{config.appName}</strong>. By accessing or using our platform (hereinafter referred to as the "Service"), you agree to these Terms of Service ("ToS"). If you do not agree to these terms, please refrain from using the Service.</p>

    <hr>

    <h2>1. Definitions</h2>
    <ul>
        <li><strong>Service</strong>: The <strong>{config.appName}</strong> platform, accessible via the website <strong>{config.appUrl}</strong>, and its associated features.</li>
        <li><strong>User</strong>: Any individual or entity accessing or using the Service.</li>
        <li><strong>Account</strong>: The User's personal access credentials to the Service, created through registration.</li>
        <li><strong>Partner</strong>: Third-party entities collaborating with <strong>{config.appName}</strong>, such as payment processors or API providers.</li>
    </ul>

    <h2>2. Acceptance of Terms</h2>
    <p>By using the Service, you confirm that:</p>
    <ul>
        <li>You are at least {config.minimumLegalAge} years old or meet the minimum age required by the laws of your country.</li>
        <li>You have the legal capacity to enter into a contract with us.</li>
        <li>You agree to comply with all applicable local, national, and international laws while using the Service.</li>
    </ul>

    <h2>3. Service Description</h2>
    <p><strong>{config.appName}</strong> provides <strong>{config.serviceDescription}</strong>. The Service is offered online through a user interface accessible from any Internet-connected device.</p>

    <h2>4. Account Creation and Management</h2>
    <ol>
        <li><strong>Registration:</strong> To access the Service, you must provide accurate, complete, and up-to-date information when creating an account.</li>
        <li><strong>Account Confidentiality:</strong> You are responsible for maintaining the confidentiality of your credentials and all activities conducted through your account.</li>
        <li><strong>Restrictions:</strong> We reserve the right to suspend or terminate any account that violates these ToS or is used unlawfully.</li>
    </ol>

    <h2>5. Payments and Pricing</h2>
    <ol>
        <li><strong>Subscription:</strong> Full access to the Service may require a paid subscription, as described on <a href="/pricing">our pricing page</a>.</li>
        <li><strong>Payment Processors:</strong> Payments are processed through <strong>Paddle</strong>. By making a payment,  you also agree to the terms of our payment processor.</li>
        <li><strong>Price Changes:</strong> We reserve the right to modify our prices at any time, with a notice period of {config.priceChangePeriod} days.</li>
    </ol>

    <h2>6. Refunds policy</h2>
    <p>You can see all information about this policy in our <a href="/legals/refunds-policy">Refunds Policy</a> page.</p>


    <h2>7. Obligations and Restrictions</h2>
    <ol>
        <li><strong>Prohibitions:</strong> Users are prohibited from:
            <ul>
                <li>Use the Service for illegal purposes.</li>
                <li>Attempting to harm the Service, its infrastructure, or other users.</li>
            </ul>
        </li>
        <li><strong>Legal Compliance:</strong> Users must comply with all applicable laws when using the Service.</li>
    </ol>

    <h2>8. Intellectual Property</h2>
    <ol>
        <li><strong>Platform Ownership:</strong> All rights, titles, and interests related to the Service, including but not limited to the source code, content, and user interface, remain the property of <strong>{config.ownerFullName}</strong>.</li>
        <li><strong>License to Use:</strong> We grant you a non-exclusive, non-transferable, and revocable license to use the Service.</li>
    </ol>

    <h2>9. Limitation of Liability</h2>
    <ol>
        <li><strong>Exclusions:</strong> We are not liable for any damages arising from your use or inability to use the Service, except in cases of intentional misconduct or gross negligence, to the fullest extent permitted by applicable law.</li>
        <li><strong>Availability:</strong> We do not guarantee continuous or error-free availability of the Service.</li>
        <li><strong>Force Majeure:</strong> We are not responsible for interruptions caused by circumstances beyond our reasonable control.</li>
    </ol>

    <h2>10. Termination</h2>
    <ol>
        <li><strong>By You:</strong> You may terminate your account at any time through your user dashboard or by contacting support.</li>
        <li><strong>By Us:</strong> We may suspend or terminate your account for any violation of these ToS or in cases of misuse of the Service.</li>
    </ol>

    <h2>11. Personal Data</h2>
    <p><strong>{config.appName}</strong> respects your privacy. We collect, use, and protect your personal data in accordance with our <a href="/legals/privacy">Privacy Policy</a>. Users in the EU have the right to access, rectify, or delete their data under the GDPR. You may also lodge a complaint with your local data protection authority (e.g., CNIL in France).</p>

    <h2>12. Changes to the ToS</h2>
    <p>We reserve the right to modify these ToS at any time. Users will be notified at least {config.termsChangePeriod} days in advance of any material changes. Continued use of the Service constitutes acceptance of the revised ToS.</p>

    <h2>13. Governing Law and Jurisdiction</h2>
    <p>For EU residents, these ToS are governed by the laws of your country of residence. For other users, the governing law will be the laws of <strong>{config.ownerCountry}</strong>. Disputes shall be resolved in the competent courts of <strong>{config.ownerCity}</strong>, <strong>{config.ownerCountry}</strong>, unless otherwise required by applicable consumer protection laws.</p>

    <h2>14. Contact</h2>
    <p>For any questions or complaints, you can contact us at:</p>
    <ul>
        <li><strong>Email:</strong> <a href="mailto:{config.emailContact}">{config.emailContact}</a></li>
        <li><strong>Address:</strong> {config.ownerAddress}</li>
    </ul>

    <h2>Acceptance of the ToS</h2>
    <p>By using the Service, you confirm that you have read and understood these Terms of Service.</p>
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