// js/auth0-config.js

let auth0Client = null;
let currentUser = null;

async function initAuth0() {
    try {
        auth0Client = await createAuth0Client({
            domain: "dev-ej7oma8mgej73zwb.eu.auth0.com",
            clientId: "bV9k1JybdoaIGE8MSCWerNw1dxzN2rHZ",
            authorizationParams: {
                redirect_uri: window.location.origin + "/index.html",
                response_type: "code",
                scope: "openid profile email"
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

async function handleLogin(connection) {
    if (!auth0Client) {
        alert("Auth0 is still initializing. Please wait or refresh the page.");
        return;
    }

    await auth0Client.loginWithRedirect({
        authorizationParams: {
            connection: connection
        }
    });
}

async function handleLogout() {
    if (auth0Client) {
        await auth0Client.logout({
            logoutParams: { returnTo: window.location.origin }
        });
    }
}

// Initialize Auth0 when page loads
// document.addEventListener('DOMContentLoaded', () => {
//     initAuth0();
//     showPage('home');
// });