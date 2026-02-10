import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";

//patientFirstName, doctorName, apptDate, apptTime, clinicName, clinicPhone, clinicAddress, isWithLocation

export async function POST(req) {
  const dbName = req.headers.get("db-name");

  try {
    //   const auth = await requireAuth(rolePermissions.patients.createPatient);
    //   if (!auth.ok) {
    //     return NextResponse.json(
    //       { success: false, error: auth.message },
    //       { status: auth.status }
    //     );
    //   }
    // const { clinic } = auth;
    // const accessError = checkAccess(
    // clinic,
    // dbName,
    // FeatureMapping.WHATSAPP_REMINDERS,
    // );
    if (accessError) return accessError;

    const body = await req.json();

    // const result = await createPatient(body, dbName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in POST /api/patients:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  try {
    const { to, body } = await req.json();

    const message = await client.messages.create({
      from: `whatsapp:+${from}`,
      to: `whatsapp:${to}`,
      body: body,
    });

    return NextResponse.json({
      success: true,
      sid: message.sid,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
