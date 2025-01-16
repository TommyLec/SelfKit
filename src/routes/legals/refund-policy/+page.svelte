<script>
	import { config } from "$lib/selfkit.config";

</script>
<div class="p-6">
    <h1>Privacy Policy</h1>
    <p>Effective Date: {new Date().toDateString()}</p>

    <p>{config.appName} (“we,” “our,” or “us”) is committed to ensuring customer satisfaction. This Refund Policy outlines the conditions and process for obtaining refunds for purchases made through our platform. By using our services, you agree to the terms outlined below.</p>

    <hr>

    <h2>1. Eligibility for Refunds</h2>
    <h3>1.1 Right of Withdrawal (EU Customers)</h3>
    <p>If you are a resident of the European Union, you have the right to withdraw from the Service within {config.refundsPeriod} days of your first payment, as per EU consumer protection laws, provided that:</p>
    <ul>
        <li>The subscription period has not been fully utilized.</li>
        <li>The service has not been extensively used (e.g., creating multiple accounts, exporting significant data)</li>
    </ul>

    <h3>1.2 General Eligibility</h3>
    <p>Refunds are granted only under the following conditions:</p>
    <ul>
        <li>The refund request is made within 14 days of the initial payment.</li>
        <li>You have not substantially used the Service (e.g., limited login or feature interaction).</li>
        <li>The refund is for the first payment only (renewals are non-refundable).</li>
    </ul>

    <h2>2. Non-Refundable Situations</h2>
    <p>We do not provide refunds for:</p>
    <ul>
        <li>Partial usage of a subscription beyond 14 days.</li>
        <li>Downgrades to lower subscription tiers.</li>
        <li>Failure to cancel the subscription before the renewal date.</li>
        <li>Services purchased as part of promotional bundles or discounts.</li>
    </ul>

    <h2>3. Refund Request Process</h2>
    <p>To request a refund, follow these steps:</p>
    <h3>1.Contact Support:</h3>
    <ul>
        <li>Send an email to <a href="mailto:{config.emailContact}">{config.emailContact}</a> with the subject line "Refund Request."</li>
        <li> Include the following information:
            <ul>
                <li>Full name</li>
                <li>Email address associated with your account</li>
                <li>Payment details (e.g., date, amount, and transaction ID)</li>
                <li>Reason for the refund request</li>
            </ul>
        </li>
    </ul>
    <h3>2. Verification:</h3>
    <p>Our support team will verify your eligibility and may request additional information to process your request.</p>
    <h3>3. Approval:</h3>
    <p>If approved, the refund will be processed within {config.refundsProcessPeriod} business days and credited to your original payment method.</p>

    <h2>4. Additional Information</h2>
    <h3>4.1 Payment Processor Terms</h3>
    <p>Refunds are processed through Paddle, our payment processor. By making a payment, you agree to their terms and policies. Processing times for refunds may vary depending on your payment method or financial institution.</p>
    <h3>4.2 Chargebacks</h3>
    <p>If you initiate a chargeback without first contacting our support team, we reserve the right to dispute the chargeback and terminate your account.</p>

    
    <h2>5. Contact Us</h2>
    <p>If you have questions or concerns about this Refund Policy, please reach out to us:</p>
    <ul>
        <li>Email: <a href="mailto:{config.emailContact}">{config.emailContact}</a></li>
        <li>Address: {config.ownerAddress}</li>
    </ul>
    <p>By using SelfKit, you acknowledge that you have read and agree to this Refund Policy.</p>
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