// returns the health of the application
// status 200
export async function GET() {
    // Check for specific health criteria if necessary (e.g., database connectivity)

    return new Response(
        // code and message
        JSON.stringify({
            statusCode: 200,
            message: "Healthy"
        }),
        {
            status: 200,
        },
    );
}

