let jwt = require('jsonwebtoken');
let uuid4 = require('uuid4');

// A service class for Token generation and management

//app_access_key and secret should be replaced with live app's credentials
class TokenService {
    // static #app_access_key = '641d45910e077649845bdf94';
    // static #app_secret = 'DvMSx26WoxnASfiLv4JOANhelFUQd7MYDWY_7bmxgy1m7C-kxP33-rftnE7YiaexuXQ7xPEK1TS9jPjxLRKyDu_bEfPPAcKQD6GxHTzfQfhnS_x5njHBc2CUMK5SNq4kgQLtUldSS6F9nib8m3pTXPsTwZiuB2a17q4uJQ79WzY=';
    static #app_access_key = '646451cc95f194d5e50975f8';
    static #app_secret = '3aQa01QOwa5xYydsArojd0icqJBlIzhJA4YcdsXTgKZ8uJbsCyrnCOXTNXaQNvsS88kpJNe3Q8fS6W9-w_pkZPuK8o5oacz07__BumDIjlNYqS4CILF37FXeehpcspaq55ZmHsW101R3qgVzuRD8cvkKzPBPmnrm_kZQOJSUhjA=';
    #managementToken;
    constructor() {
        this.#managementToken = this.getManagementToken(true);
    }

    // A private method that uses JWT to sign the payload with APP_SECRET
    #signPayloadToToken(payload) {
        let token = jwt.sign(
            payload,
            TokenService.#app_secret,
            {
                algorithm: 'HS256',
                expiresIn: '24h',
                jwtid: uuid4()
            }
        );
        return token;
    }

    // A private method to check if a JWT token has expired or going to expire soon
    #isTokenExpired(token) {
        try {
            const { exp } = jwt.decode(token);
            const buffer = 30; // generate new if it's going to expire soon
            const currTimeSeconds = Math.floor(Date.now() / 1000);
            return !exp || exp + buffer < currTimeSeconds;
        } catch (err) {
            console.log("error in decoding token", err);
            return true;
        }
    }

    // Generate new Management token, if expired or forced
    getManagementToken(forceNew) {
        if (forceNew || this.#isTokenExpired(this.#managementToken)) {
            let payload = {
                access_key: TokenService.#app_access_key,
                type: 'management',
                version: 2,
                iat: Math.floor(Date.now() / 1000),
                nbf: Math.floor(Date.now() / 1000)
            };
            this.#managementToken = this.#signPayloadToToken(payload);
        }
        return this.#managementToken;
    }

    // Generate new Auth token for a peer
    getAuthToken({ room_id, user_id, role }) {
        let payload = {
            access_key: TokenService.#app_access_key,
            room_id: room_id,
            user_id: user_id,
            role: role,
            type: 'app',
            version: 2,
            iat: Math.floor(Date.now() / 1000),
            nbf: Math.floor(Date.now() / 1000)
        };
        return this.#signPayloadToToken(payload);
    }
}

module.exports = TokenService;