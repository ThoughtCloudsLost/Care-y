/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Password_BodyInputs */

const en_demo_narrative_client_account_password_body = /** @type {(inputs: Demo_Narrative_Client_Account_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changing the password keeps the conversation and ends every other session, and the new password must be at least eight characters. [[#keys #portal]]
**Why a new password means re-encryption.** The keys that open the client's messages come from the password, so a new password is a new key. The browser proves the current password to the server, derives a new key against a fresh salt, decrypts every message it can still open and re-encrypts it to the new key, and submits the lot in one call. Anything the device could not open stays sealed to the superseded key, because it was already unreadable there. [How keys are derived](#deep-dive/how-keys-are-derived) covers the derivation, which is the same one the sign-in runs. [[#keys #encryption]]
**The guard on a racing message.** The server checks inside the transaction that the re-encrypted list and the declared-unreadable list together cover exactly the channel's messages. A message that arrived while the change was in flight belongs to neither, so the write is refused and the browser starts again from a fresh read rather than leaving a message sealed to a key nobody holds. [[#failure-states #encryption]]
**What the change does to sessions.** Every session on the account except the one making the change is deleted in the same transaction, so a session opened on another device stops working at that moment. The account identifier does not change, because it names the client rather than their key. [[#server-holds #keys]]
**When the password is gone.** There is no reset the client can run and no recovery question. The only route is an organization-mediated reset, which deletes the account, deletes the client's copies of the conversation and returns the client to text and email. [Durable thread](#client-account/thread) covers what the reset removes. [[#failure-states #retention]]
**The change path and its counterpart.** The form is \`AccountSettings.svelte\`, the registration material is rebuilt by \`buildAccountRegistration\` in \`packages/client/src/lib/portal/account-crypto.ts\`, and the server side is \`changePassword\` in \`packages/server/src/portal/account-service.ts\`. A member of staff changing their own password runs a different service on the same shape of derivation, which [Password](#settings/password) covers. [[#keys #server-holds]]`)
};

const es_demo_narrative_client_account_password_body = /** @type {(inputs: Demo_Narrative_Client_Account_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar la contraseña conserva la conversación y termina todas las demás sesiones, y la contraseña nueva debe tener al menos ocho caracteres. [[#keys #portal]]
**Por qué una contraseña nueva implica volver a cifrar.** Las claves que abren los mensajes del cliente salen de la contraseña, así que una contraseña nueva es una clave nueva. El navegador acredita la contraseña actual ante el servidor, deriva una clave nueva con una sal nueva, descifra todos los mensajes que todavía puede abrir, los vuelve a cifrar con la clave nueva y envía el conjunto en una sola llamada. Lo que el dispositivo no pudo abrir sigue sellado con la clave sustituida, porque allí ya era ilegible. [Cómo se derivan las claves](#deep-dive/how-keys-are-derived) trata la derivación, que es la misma que ejecuta el inicio de sesión. [[#keys #encryption]]
**La guarda ante un mensaje que llega a la vez.** El servidor comprueba dentro de la transacción que la lista de mensajes vueltos a cifrar y la de declarados ilegibles cubren juntas exactamente los mensajes del canal. Un mensaje llegado mientras el cambio estaba en curso no está en ninguna de las dos, así que la escritura se rechaza y el navegador vuelve a empezar desde una lectura nueva en lugar de dejar un mensaje sellado con una clave que nadie tiene. [[#failure-states #encryption]]
**Qué le hace el cambio a las sesiones.** Todas las sesiones de la cuenta salvo la que realiza el cambio se eliminan en la misma transacción, de modo que una sesión abierta en otro dispositivo deja de funcionar en ese momento. El identificador de la cuenta no cambia, porque nombra al cliente y no a su clave. [[#server-holds #keys]]
**Cuando la contraseña se ha perdido.** No hay ningún restablecimiento que el cliente pueda ejecutar ni pregunta de recuperación. La única vía es un restablecimiento mediado por la organización, que elimina la cuenta, elimina las copias de la conversación que tiene el cliente y devuelve al cliente a texto y correo. [Hilo duradero](#client-account/thread) trata lo que elimina ese restablecimiento. [[#failure-states #retention]]
**La ruta del cambio y su equivalente.** El formulario es \`AccountSettings.svelte\`, el material de registro lo reconstruye \`buildAccountRegistration\`, en \`packages/client/src/lib/portal/account-crypto.ts\`, y el lado del servidor es \`changePassword\`, en \`packages/server/src/portal/account-service.ts\`. Una persona del personal que cambia su propia contraseña ejecuta un servicio distinto sobre la misma forma de derivación, que trata [Contraseña](#settings/password). [[#keys #server-holds]]`)
};

const en_xa2_demo_narrative_client_account_password_body = /** @type {(inputs: Demo_Narrative_Client_Account_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngìng thè pàsswòrd ènds èvèry òthèr àctìvè sèssìòn ànd kèèps thè clìènt's mèssàgè hìstòry, ànd thè nèw pàsswòrd mùst bè àt lèàst 8 chàràctèrs.
 ••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Thè bròwsèr sènds thè cùrrènt pàsswòrd's dèrìvèd àùth tòkèn tò thè sèrvèr fòr vèrìfìcàtìòn, dèrìvès nèw kèys fròm thè nèw pàsswòrd thròùgh thè sàmè dèlìbèràtèly slòw pìpèlìnè ùsèd àt sìgn ìn, rè-wràps thè àccòùnt's kèy màtèrìàl ùndèr thè nèw kèys, ànd tèrmìnàtès àll òthèr àctìvè sèssìòns ìn à sìnglè sèrvèr càll, wìth à prògrèss ìndìcàtòr àppèàrìng dùrìng thè dèrìvàtìòn stèps.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt sùrvìvès. •••••** Thè bròwsèr rè-èncrypts mèssàgè còpìès thè clìènt càn stìll dècrypt ùndèr thè nèw crèdèntìàls, ànd ànythìng àlrèàdy ùnrèàdàblè òn thàt dèvìcè stàys thàt wày, sò nòthìng rèàdàblè ìs lòst. À fòrgòt pàsswòrd rèsèt ìs à dìffèrènt ànd dèstrùctìvè pàth whèrè à ùsèr mèdìàtès thè pròcèss. Thè àccòùnt, ìts mèssàgè còpìès, ànd thè chànnèl àrè rèmòvèd, thè còmmùnìcàtìòn tìèr dròps bàck tò SMS ànd èmàìl, ànd thèrè ìs nò òthèr wày tò rècòvèr à fòrgòttèn pàsswòrd. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Changing the password keeps the conversation and ends every other session, and the new password must be at least eight characters. [[#keys #portal]] **Why a ..." |
*
* @param {Demo_Narrative_Client_Account_Password_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_password_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Password_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Password_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_password_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_account_password_body(inputs)
	return en_demo_narrative_client_account_password_body(inputs)
});