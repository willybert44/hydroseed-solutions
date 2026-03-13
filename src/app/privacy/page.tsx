import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Privacy Policy</h1>
      <div className="prose prose-lg dark:prose-invert text-text-secondary">
        <p>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <h2>1. Introduction</h2>
        <p>At Hydroseed Solutions, your privacy is our priority. This Privacy Policy details how we collect, use, and protect your information when you visit our website or use our services.</p>

        <h2>2. Information We Collect</h2>
        <p>We may collect personal information such as your name, email address, phone number, and physical address when you request a quote, submit a contact form, or communicate with us.</p>

        <h2>3. How We Use Your Information</h2>
        <p>We use your information to provide our services, respond to your inquiries, deliver quotes, and communicate essential updates regarding your requests.</p>

        <h2>4. SMS and Text Messaging (10DLC Compliance)</h2>
        <p>If you opt-in to receive SMS notifications, we will send text messages relating to your quote, project updates, or service inquiries. <strong>Mobile information will not be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</strong></p>
        <p>You can opt-out of text messages at any time by replying "STOP". If you need assistance, reply "HELP".</p>

        <h2>5. Information Sharing</h2>
        <p>We do not sell, rent, or trade your personal information to third parties for their marketing purposes. We may share information with trusted service providers who assist us in operating our website or conducting our business, so long as those parties agree to keep this information confidential.</p>

        <h2>6. Security</h2>
        <p>We implement appropriate security measures to maintain the safety of your personal information. However, no data transmission or storage system can be guaranteed to be 100% secure.</p>

        <h2>7. Contact Us</h2>
        <p>If you have any questions regarding this Privacy Policy, please contact us at <strong>hello@hydroseed.solutions</strong>.</p>
      </div>
    </div>
  );
}
