async function initAuth0() {
    try {
        auth0Client = await createAuth0Client({
            domain: "dev-ej7oma8mgej73zwb.eu.auth0.com",
            clientId: "bV9k1JybdoaIGE8MSCWerNw1dxzN2rHZ",
            
            authorizationParams: {
                redirect_uri: window.location.origin + "/index.html",
                response_type: "code",
                scope: "openid profile email"     // Removed audience
            },

            cacheLocation: "localstorage",
            useRefreshTokens: true
        });

        console.log("✅ Auth0 Initialized Successfully");

        if (await auth0Client.isAuthenticated()) {
            currentUser = await auth0Client.getUser();
            updateUIAfterLogin(currentUser);
        } else {
            updateUIBeforeLogin();
        }

    } catch (error) {
        console.error("❌ Auth0 Initialization Failed:", error);
    }
}