import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Get Zoho OAuth token (Requires setting up a Zoho OAuth client with Zoho Books scope)
    const tokenResponse = await fetch(`https://accounts.zoho.com/oauth/v2/token?refresh_token=${process.env.ZOHO_REFRESH_TOKEN}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`, {
      method: "POST",
    });
    
    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("Zoho Token Error:", tokenError);
      throw new Error(`Failed to authenticate with Zoho: ${tokenError}`);
    }

    const { access_token } = await tokenResponse.json();
    const organization_id = process.env.ZOHO_ORGANIZATION_ID;

    // 2. Create or find customer in Zoho Books
    // For this example, we'll create a new customer based on the estimate data.
    // In a real scenario, you'd want to search for the customer by email first.
    const customerResponse = await fetch(`https://books.zoho.com/api/v3/contacts?organization_id=${organization_id}`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_name: data.email ? `Lead - ${data.email}` : "Hydroseeding Lead",
        customer_sub_type: "individual",
        email: data.email || null, // Best effort, since the planner doesn't collect this until the end usually
      }),
    });

    const contactData = await customerResponse.json();
    const customer_id = contactData.contact?.contact_id;
    
    if (!customer_id) {
       console.error("Failed to create/get contact. Zoho response:", contactData);
       throw new Error(`Could not create contact: ${contactData.message || JSON.stringify(contactData)}`);
    }

    // 3. Create a retainer invoice (deposit) in Zoho Books
    const depositAmount = Math.round(Number(data.estimateBase ?? 0) * 0.15);

    const retainerResponse = await fetch(`https://books.zoho.com/api/v3/retainerinvoices?organization_id=${organization_id}`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customer_id,
        line_items: [
          {
            description: `15% Project Deposit (Estimate: $${Math.round(Number(data.estimateBase ?? 0))})`,
            rate: depositAmount,
            quantity: 1,
          }
        ],
        notes: `Property specs:\nSqFt: ${data.squareFeet}\nSlope: ${data.slope}\nGrading: ${data.grading}\nSoil Import: ${data.soilImport}\nSeed Blend: ${data.seedBlend}\nSun: ${data.sun}`,
        is_inclusive_tax: false
      }),
    });

    const retainerData = await retainerResponse.json();
    console.log("RETAINER DATA RESPONSE: ", JSON.stringify(retainerData, null, 2));
    const retainer_invoice_id = retainerData.retainerinvoice?.retainerinvoice_id;

    if (!retainer_invoice_id) {
      console.error("Failed to create retainer invoice. Zoho response:", retainerData);
      throw new Error(`Could not create deposit in Zoho Books: ${retainerData.message || JSON.stringify(retainerData)}`);
    }

    // 4. Return the payment link to the frontend (Requires a payment gateway linked to Zoho Books)
    // You will need to fetch the payment link for the created retainer invoice
    const paymentLinkResponse = await fetch(`https://books.zoho.com/api/v3/retainerinvoices/${retainer_invoice_id}/paymentlink?organization_id=${organization_id}`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
        "Content-Type": "application/json"
      }
    });
    
    const paymentLinkData = await paymentLinkResponse.json();
    const paymentUrl = paymentLinkData.payment_link;

    if (!paymentUrl) {
      console.error("Failed to generate payment link. Zoho response:", paymentLinkData);
      throw new Error(`Unable to generate Zoho payment link: ${paymentLinkData.message || JSON.stringify(paymentLinkData)}`);
    }

    return NextResponse.json({ checkoutUrl: paymentUrl });
  } catch (error: any) {
    console.error("Zoho Books integration error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to create Zoho deposit" },
      { status: 500 }
    );
  }
}
