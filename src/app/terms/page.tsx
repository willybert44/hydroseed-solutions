import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions of Service',
  description:
    'Hydroseed Solutions terms and conditions governing hydroseeding services, payment, warranties, and dispute resolution in Western Pennsylvania.',
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-2">Hydroseed Solutions</p>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms &amp; Conditions of Service</h1>
      <p className="text-text-secondary mb-10 italic">Effective upon client signature or written acceptance of proposal</p>

      <div className="prose prose-lg dark:prose-invert text-text-secondary">

        {/* 1 */}
        <h2>1. Definitions</h2>
        <p>For the purposes of these Terms and Conditions:</p>
        <ul>
          <li><strong>&quot;Company&quot;</strong> refers to Hydroseed Solutions and its authorized representatives.</li>
          <li><strong>&quot;Client&quot;</strong> refers to the individual or entity entering into an agreement for services.</li>
          <li><strong>&quot;Project&quot;</strong> refers to the hydroseeding or related services described in the proposal.</li>
          <li><strong>&quot;Proposal&quot;</strong> refers to the written estimate, scope of work, and pricing issued by the Company.</li>
          <li><strong>&quot;Services&quot;</strong> refers to all labor, materials, and related work performed by the Company.</li>
        </ul>

        {/* 2 */}
        <h2>2. Acceptance of Terms</h2>
        <p>
          By signing or providing written acceptance of a Proposal, the Client agrees to be bound by these Terms and Conditions in their entirety. These Terms constitute the complete agreement between the parties and supersede all prior representations, negotiations, or understandings, whether oral or written. No modification to these Terms shall be effective unless made in writing and signed by an authorized representative of both parties.
        </p>

        {/* 3 */}
        <h2>3. Deposits &amp; Payment Terms</h2>

        <h3>3.1 Projects Under $100,000</h3>
        <p>Payment is due in full upon satisfactory completion of the Project. No deposit is required for projects with an estimated cost below $100,000.</p>

        <h3>3.2 Projects of $100,000 or More</h3>
        <p>
          A deposit may be required prior to the commencement of work. The specific deposit amount and any progress draw schedule will be detailed in the Proposal. Once work has begun, or after the Client&apos;s 3-day right of rescission period has expired (whichever occurs first), any deposit paid is non-refundable.
        </p>

        <h3>3.3 Progress Draws</h3>
        <p>
          For larger projects, milestone-based progress payments may be required as outlined in the Proposal. Failure to remit a progress draw on time may result in a work stoppage until payment is received, without liability to the Company for project delays caused thereby.
        </p>

        <h3>3.4 Late Payment</h3>
        <p>
          Invoices not paid within the period specified in the Proposal will accrue interest at a rate of 1.5% per month (18% per annum) on the outstanding balance, beginning on the due date. The Company reserves the right to suspend or terminate services for accounts more than 15 days past due.
        </p>

        <h3>3.5 Collection</h3>
        <p>
          In the event that collection proceedings are necessary to recover an unpaid balance, the Client shall be responsible for all reasonable attorneys&apos; fees, court costs, and collection expenses incurred by the Company, to the extent permitted by applicable law.
        </p>

        <h3>3.6 Accepted Payment Methods</h3>
        <p>
          The Company accepts payment by check, credit card, and cash. Credit card payments may be subject to a processing fee, which will be disclosed at the time of payment.
        </p>

        {/* 4 */}
        <h2>4. Proposal Validity &amp; Scheduling</h2>

        <h3>4.1 Validity Period</h3>
        <p>All Proposals, including these Terms and Conditions, are valid for 30 days from the date of issuance. After 30 days, the Company reserves the right to revise pricing and scope without notice.</p>

        <h3>4.2 Scheduling</h3>
        <p>
          Project scheduling is subject to availability of labor, materials, and equipment, as well as weather conditions and other factors outside the Company&apos;s reasonable control. The Company will make good-faith efforts to adhere to agreed timelines but does not guarantee specific start or completion dates. Scheduling delays caused by weather, Client-side factors, or force majeure events shall not constitute a breach of contract by the Company.
        </p>

        <h3>4.3 Commencement</h3>
        <p>Work will commence upon the Client&apos;s signed or written acceptance of the Proposal and, where applicable, receipt of the required deposit.</p>

        {/* 5 */}
        <h2>5. Seed Selection</h2>
        <p>
          Where specific seed varieties are not designated in the approved Proposal or project plans, Hydroseed Solutions will apply its professional judgment to select seed varieties appropriate for the site&apos;s soil composition, climate, sun exposure, drainage characteristics, and intended use. The Company&apos;s seed selection is aimed at optimizing germination success and long-term stand establishment. The Client acknowledges that seed variety substitutions may be made at the Company&apos;s discretion when specified varieties are unavailable, provided that substitutes of comparable quality and suitability are used.
        </p>

        {/* 6 */}
        <h2>6. Germination Warranty &amp; Limitations</h2>

        <h3>6.1 Scope of Warranty</h3>
        <p>
          Hydroseed Solutions warrants that all services will be performed in a professional and workmanlike manner consistent with industry standards. The Company&apos;s warranty with respect to seed germination is limited to the quality of the materials applied and the care taken in application.
        </p>

        <h3>6.2 Exclusions</h3>
        <p>The Company makes no warranty, express or implied, regarding germination outcomes affected by conditions beyond its reasonable control, including but not limited to:</p>
        <ul>
          <li>Drought, flooding, frost, hail, or other extreme weather events occurring after application</li>
          <li>Soil contamination, subsurface conditions, or pre-existing site deficiencies not disclosed prior to the Project</li>
          <li>Foot traffic, vehicle traffic, erosion, or other physical disturbance to the seeded area during the establishment period</li>
          <li>Irrigation failure, under-watering, or over-watering by the Client after application</li>
          <li>Acts of nature, vandalism, or pest or wildlife damage</li>
        </ul>

        <h3>6.3 Client Obligations</h3>
        <p>
          The Client is responsible for maintaining adequate irrigation of seeded areas following application per the Company&apos;s written post-application care instructions. Failure to comply with care instructions voids any warranty obligations of the Company.
        </p>

        {/* 7 */}
        <h2>7. Additional Visits &amp; Touch-Up Services</h2>
        <p>
          If, upon inspection, a completed Project requires touch-up application due to factors within the Company&apos;s control, the Company will schedule a return visit at no additional charge within a reasonable timeframe. Touch-up services required due to causes outside the Company&apos;s control — including but not limited to erosion, irrigation failure, foot traffic, or extreme weather — will be invoiced separately at the prevailing rate of $0.14 per square foot, subject to a minimum charge. The necessity for touch-up services and their cause will be assessed by the Company in its professional judgment. All additional service visits require a separate written authorization from the Client prior to scheduling.
        </p>

        {/* 8 */}
        <h2>8. Extras &amp; Unforeseen Site Conditions</h2>
        <p>
          The Proposal is based upon conditions visible and reasonably foreseeable at the time of estimate. If unforeseen site conditions are encountered during the Project that materially increase the scope, cost, or complexity of the work — including but not limited to subsurface obstructions, unstable soils, hidden utilities, or conditions not disclosed by the Client — the Company will provide a written change order detailing the revised scope and associated costs prior to performing additional work. No additional work will be performed without the Client&apos;s written authorization. Additional services will be invoiced separately and are subject to these Terms and Conditions.
        </p>

        {/* 9 */}
        <h2>9. Client Responsibilities</h2>
        <p>The Client agrees to:</p>
        <ul>
          <li>Provide the Company with accurate and complete information regarding site conditions, property boundaries, buried utilities, irrigation systems, and any other relevant factors prior to commencement of work</li>
          <li>Ensure the work area is accessible on the scheduled start date, free of vehicles, equipment, and obstructions</li>
          <li>Notify the Company in writing of any known site hazards, deed restrictions, HOA requirements, or permit obligations</li>
          <li>Follow all post-application care instructions provided by the Company, including watering schedules and restricted access periods</li>
          <li>Obtain all required permits or authorizations for the work, unless otherwise agreed in writing</li>
        </ul>
        <p>The Company shall not be liable for delays or damages resulting from the Client&apos;s failure to fulfill these responsibilities.</p>

        {/* 10 */}
        <h2>10. Cancellation &amp; Rescheduling Policy</h2>
        <p>
          The Company requires a minimum of 24 hours&apos; advance written notice for any cancellation or rescheduling of a scheduled Project. Cancellations or postponements made with less than 24 hours&apos; notice will incur a cancellation fee of $375.00. This fee reflects direct costs associated with crew scheduling, equipment preparation, and material staging. The Company reserves the right to waive this fee at its sole discretion in the event of documented emergency circumstances.
        </p>

        {/* 11 */}
        <h2>11. Limitation of Liability</h2>
        <p className="uppercase text-sm leading-relaxed">
          To the maximum extent permitted by applicable law, Hydroseed Solutions&apos; total liability to the Client arising out of or related to these Terms or the Services provided shall be limited to the total amount paid by the Client for the specific Services giving rise to the claim. In no event shall the Company be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, including but not limited to loss of profits, loss of revenue, loss of use, loss of data, or cost of substitute services, regardless of whether such damages were foreseeable or the Company was advised of the possibility of such damages.
        </p>
        <p>
          This limitation of liability is a material and essential element of the bargain between the parties, without which the Company would not have agreed to provide the Services at the rates stated.
        </p>

        {/* 12 */}
        <h2>12. Indemnification</h2>
        <p>
          The Client agrees to indemnify, defend, and hold harmless Hydroseed Solutions and its officers, employees, agents, and subcontractors from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or resulting from: (a)&nbsp;the Client&apos;s breach of these Terms; (b)&nbsp;inaccurate or incomplete information provided by the Client; (c)&nbsp;the Client&apos;s failure to obtain required permits or approvals; (d)&nbsp;the Client&apos;s failure to follow post-application care instructions; or (e)&nbsp;any third-party claims relating to work performed on property owned or controlled by the Client.
        </p>

        {/* 13 */}
        <h2>13. Insurance</h2>
        <p>
          Hydroseed Solutions maintains general liability insurance coverage in amounts consistent with industry standards. Upon written request, the Company will provide a certificate of insurance prior to commencement of work. The Client is responsible for maintaining adequate property and casualty insurance on the project site throughout the duration of the work.
        </p>

        {/* 14 */}
        <h2>14. Dispute Resolution &amp; Arbitration</h2>

        <h3>14.1 Good-Faith Negotiation</h3>
        <p>
          In the event of any dispute, controversy, or claim arising out of or relating to these Terms or the Services, the parties agree to first attempt resolution through good-faith negotiation for a period of not less than 30 days from the date one party provides written notice of the dispute to the other.
        </p>

        <h3>14.2 Binding Arbitration</h3>
        <p>
          If the dispute is not resolved through negotiation, it shall be submitted to binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration shall take place in Westmoreland County, Pennsylvania. The arbitrator&apos;s decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.
        </p>

        <h3>14.3 Costs</h3>
        <p>
          Each party shall bear its own attorneys&apos; fees and costs in connection with arbitration, except that the arbitrator may award reasonable fees and costs to the prevailing party in cases of bad-faith conduct or frivolous claims.
        </p>

        <h3>14.4 Exceptions</h3>
        <p>
          Nothing in this section shall prevent either party from seeking emergency injunctive or equitable relief from a court of competent jurisdiction to prevent irreparable harm pending arbitration.
        </p>

        {/* 15 */}
        <h2>15. Governing Law &amp; Venue</h2>
        <p>
          These Terms and Conditions are governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without regard to its conflict of law principles. To the extent any matter is not subject to arbitration under Section 14, the parties consent to the exclusive jurisdiction and venue of the state and federal courts located in Westmoreland County, Pennsylvania.
        </p>

        {/* 16 */}
        <h2>16. Electronic Funds Transfer (EFT) Authorization</h2>

        <h3>16.1 Authorization</h3>
        <p>
          By tendering a check as payment, the Client authorizes Hydroseed Solutions to initiate a one-time Electronic Funds Transfer (EFT) from the Client&apos;s designated bank account in the amount of the applicable invoice. The Client acknowledges that this transaction will appear on their bank statement as an &quot;ACH Debit.&quot;
        </p>

        <h3>16.2 Advance Notice</h3>
        <p>
          No prior notice will be provided for single-occurrence EFT transactions unless the payment date or amount changes from what was previously communicated, in which case the Company will provide at least 10 days&apos; advance notice.
        </p>

        <h3>16.3 NSF / Returned Payments</h3>
        <p>
          In the event a payment is returned due to Non-Sufficient Funds (NSF) or for any other reason, the Company reserves the right to re-initiate the transaction within 30 days of the original return date. A returned payment fee of $45.00 will be assessed for each returned item, in addition to any applicable late payment interest under Section 3.4. Repeated returned payments may result in suspension of credit terms and a requirement for certified funds on future invoices.
        </p>

        <h3>16.4 Revocation of Authorization</h3>
        <p>
          This EFT authorization remains in effect until cancelled by the Client in writing, with at least 15 days&apos; prior notice to the Company. Written notice must be sent to the Company&apos;s address of record or by email to an authorized Company representative.
        </p>

        <h3>16.5 Compliance</h3>
        <p>
          All ACH transactions are processed in accordance with applicable U.S. banking laws and NACHA Operating Rules. By tendering a check, the Client certifies that they are an authorized signatory on the referenced bank account and agrees not to dispute scheduled transactions that correspond to the terms of an accepted Proposal or invoice.
        </p>

        {/* 17 */}
        <h2>17. General Provisions</h2>

        <h3>17.1 Severability</h3>
        <p>
          If any provision of these Terms is found to be invalid, unenforceable, or contrary to applicable law, such provision shall be modified to the minimum extent necessary to make it enforceable, or severed if modification is not possible, without affecting the validity and enforceability of the remaining provisions.
        </p>

        <h3>17.2 Waiver</h3>
        <p>
          The failure of either party to enforce any provision of these Terms shall not constitute a waiver of that party&apos;s right to enforce such provision or any other provision in the future.
        </p>

        <h3>17.3 Entire Agreement</h3>
        <p>
          These Terms, together with the Proposal, constitute the entire agreement between the parties with respect to the subject matter hereof and supersede all prior negotiations, representations, or agreements.
        </p>

        <h3>17.4 Amendment</h3>
        <p>
          No amendment or modification of these Terms shall be valid unless made in writing and signed by an authorized representative of both parties.
        </p>

        <h3>17.5 Assignment</h3>
        <p>
          The Client may not assign any rights or obligations under these Terms without the prior written consent of the Company. The Company may assign its rights or obligations to an affiliate or successor entity without consent.
        </p>

        <h3>17.6 Force Majeure</h3>
        <p>
          Neither party shall be liable for delays or failures in performance resulting from causes beyond their reasonable control, including but not limited to acts of God, natural disasters, labor disputes, government orders, supply chain disruptions, or severe weather. The affected party shall provide prompt written notice and use commercially reasonable efforts to resume performance as soon as practicable.
        </p>

        <hr />
        <p className="text-center font-semibold">Hydroseed Solutions — Western Pennsylvania</p>
      </div>
    </div>
  );
}
