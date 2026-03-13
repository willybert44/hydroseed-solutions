import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Terms of Service</h1>
      <div className="prose prose-lg dark:prose-invert text-text-secondary">
        <p>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <h2>1. Agreement to Terms</h2>
        <p>By accessing or using the Hydroseed Solutions website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

        <h2>2. Services Provided</h2>
        <p>Hydroseed Solutions provides professional hydroseeding and related land management services. Estimates and quotes provided online are preliminary and subject to change upon a formal on-site evaluation.</p>

        <h2>3. SMS/Text Messaging Communications</h2>
        <p>By providing your mobile phone number and opting in, you authorize Hydroseed Solutions to send text messages regarding your project, quotes, or support inquiries.</p>
        <ul>
          <li><strong>Consent:</strong> Consent to receive SMS messages is not a condition of purchasing any goods or services.</li>
          <li><strong>Opt-Out:</strong> You may opt out of receiving text messages at any time by replying "STOP" to any of our text messages.</li>
          <li><strong>Help:</strong> Reply "HELP" to our text messages for assistance or contact us directly.</li>
          <li><strong>Rates:</strong> Standard message and data rates may apply. Program frequency varies.</li>
        </ul>

        <h2>4. User Responsibilities</h2>
        <p>Users must provide accurate, current, and complete information when submitting project requests. You are responsible for maintaining the confidentiality of any information you provide.</p>

        <h2>5. Limitation of Liability</h2>
        <p>Hydroseed Solutions shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.</p>

        <h2>6. Changes to Terms</h2>
        <p>We reserve the right to modify or replace these Terms at any time. We will post the most current version on our website. Your continued use of the services following any changes constitutes acceptance of those changes.</p>

        <h2>7. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us at <strong>hello@hydroseed.solutions</strong>.</p>
      </div>
    </div>
  );
}
