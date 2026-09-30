/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Account_DescInputs */

const en_demo_section_client_account_desc = /** @type {(inputs: Demo_Section_Client_Account_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A client account lets the client return to the same conversation with a username and password instead of a link. The password runs through the same key derivation pipeline that members of the organization sign in through. The server stores ciphertext it cannot open. There is no password reset. A user holding the Reset client login permission can delete the account so a new way back in can be set up, at the cost of the client's copies of the conversation. [How keys are derived](#deep-dive/how-keys-are-derived) covers the derivation, and [The portal channel lifecycle](#deep-dive/portal-channel-lifecycle) covers how the account channel fits the broader channel model.`)
};

const es_demo_section_client_account_desc = /** @type {(inputs: Demo_Section_Client_Account_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una cuenta de cliente permite al cliente volver a la misma conversación con un nombre de usuario y contraseña en lugar de un enlace. La contraseña pasa por el mismo proceso de derivación de claves que usan los miembros de la organización para iniciar sesión. El servidor almacena texto cifrado que no puede abrir. No existe restablecimiento de contraseña. La persona usuaria con el permiso Restablecer acceso del cliente puede eliminar la cuenta para que se pueda configurar una nueva vía de acceso, a costa de las copias de la conversación del cliente. [Cómo se derivan las claves](#deep-dive/how-keys-are-derived) trata la derivación, y [El ciclo de vida del canal del portal](#deep-dive/portal-channel-lifecycle) trata cómo encaja el canal de cuenta en el modelo general de canales.`)
};

const en_xa2_demo_section_client_account_desc = /** @type {(inputs: Demo_Section_Client_Account_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À clìènt àccòùnt lèts thè clìènt rètùrn tò thè sàmè cònvèrsàtìòn wìth à ùsèrnàmè ànd pàsswòrd ìnstèàd òf à lìnk. Thè pàsswòrd rùns thròùgh thè sàmè kèy dèrìvàtìòn pìpèlìnè thàt mèmbèrs òf thè òrgànìzàtìòn sìgn ìn thròùgh. Thè sèrvèr stòrès cìphèrtèxt ìt cànnòt òpèn. Thèrè ìs nò pàsswòrd rèsèt. À ùsèr hòldìng thè Rèsèt clìènt lògìn pèrmìssìòn càn dèlètè thè àccòùnt sò à nèw wày bàck ìn càn bè sèt ùp, àt thè còst òf thè clìènt's còpìès òf thè cònvèrsàtìòn. [Hòw kèys àrè dèrìvèd](#dèèp-dìvè/hòw-kèys-àrè-dèrìvèd) còvèrs thè dèrìvàtìòn, ànd [Thè pòrtàl chànnèl lìfècyclè](#dèèp-dìvè/pòrtàl-chànnèl-lìfècyclè) còvèrs hòw thè àccòùnt chànnèl fìts thè bròàdèr chànnèl mòdèl. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A client account lets the client return to the same conversation with a username and password instead of a link. The password runs through the same key deriv..." |
*
* @param {Demo_Section_Client_Account_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_account_desc = /** @type {((inputs?: Demo_Section_Client_Account_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Account_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_account_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_account_desc(inputs)
	return en_demo_section_client_account_desc(inputs)
});