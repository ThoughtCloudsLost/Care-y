/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Credentials_BodyInputs */

const en_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign-in requires a username and password. The username is a login identifier, not an email address, chosen at account creation by the user or an admin.
**How it works.** The password serves two purposes. One copy is checked against the server to confirm identity. The server stores only a one-way hash, never the password itself. A separate copy stays in the browser and feeds a key-derivation process that unlocks the organization's encrypted data. The server never sees this second copy and cannot influence how it works. The derivation parameters are fixed in the browser's code, so a compromised server cannot weaken them.
**Encryption.** The encryption keys produced from the password exist only in browser memory. They are erased when the tab closes. They are never stored on the server, never written to disk, and never transmitted. If someone gains access to the server, there are no keys to find.
**If it fails.** There is no password reset and no recovery link. Admins cannot set or see another account's password. A lost password means the account is gone, but cases are unaffected because each case key is wrapped individually per user. Everyone else keeps access to the same data.`)
};

const es_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El inicio de sesión requiere un nombre de usuario y una contraseña. El nombre de usuario es un identificador de inicio de sesión, no una dirección de correo electrónico, elegido en la creación de la cuenta por la persona usuaria o la persona administradora.
**Cómo funciona.** La contraseña cumple dos funciones. Una copia se comprueba contra el servidor para confirmar la identidad. El servidor almacena solo un hash unidireccional, nunca la contraseña en sí. Una copia separada permanece en el navegador y alimenta un proceso de derivación de claves que desbloquea los datos cifrados de la organización. El servidor nunca ve esta segunda copia y no puede influir en su funcionamiento. Los parámetros de derivación están fijados en el código del navegador, de modo que un servidor comprometido no puede debilitarlos.
**Cifrado.** Las claves de cifrado producidas a partir de la contraseña existen solo en la memoria del navegador. Se borran al cerrar la pestaña. Nunca se almacenan en el servidor, nunca se escriben en disco y nunca se transmiten. Si alguien accede al servidor, no hay claves que encontrar.
**Si falla.** No existe recuperación de contraseña ni enlace de restablecimiento. La persona administradora no puede ver ni establecer la contraseña de otra cuenta. Una contraseña perdida significa que la cuenta desaparece, pero los casos no se ven afectados porque la clave de cada caso se envuelve individualmente por persona usuaria. Las demás personas conservan el acceso a los mismos datos.`)
};

/**
* | output |
* | --- |
* | "Sign-in requires a username and password. The username is a login identifier, not an email address, chosen at account creation by the user or an admin. **How..." |
*
* @param {Demo_Narrative_Topic_Credentials_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_credentials_body = /** @type {((inputs?: Demo_Narrative_Topic_Credentials_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Credentials_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_credentials_body(inputs)
	return en_demo_narrative_topic_credentials_body(inputs)
});