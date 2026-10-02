/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Sign_Out_BodyInputs */

const en_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Signing out wipes the keys in the browser first, then ends the server-side session and expires the cookie. The page shows a voluntary sign-out confirmation and returns to the sign-in form. [[#portal #keys]]
**What separates sign-out from closing the tab?** Sign-out wipes the keys and revokes the server session immediately. The idle timeout does the same. Closing the tab or navigating to another page zeroes the keys in the browser but does not revoke the server session; that session lapses within twenty minutes of the last renewal. Quick exit replaces the page with a safe destination and also revokes the session. [On the device](#deep-dive/on-the-device) covers what stays in the browser after the keys are gone. [Quick exit](#client-portal/quick-exit) covers the other path and what it does differently. [[#server-holds #failure-states]]
**What does sign-out not hide?** The tab title stays unchanged and the browser stays on the page. Sign-out does not conceal that the page was visited. A client who needs concealment has quick exit. [[#privacy]]
**The logout handler and the cookie.** The handler runs against \`accountLogout\` in \`packages/server/src/routes/client-portal.ts\`, which calls \`logout\` in \`packages/server/src/portal/account-service.ts\`. The server hashes the token from the cookie, deletes the matching session row, and returns an expired cookie. The deletion is idempotent and the server learns only that a session ended. [[#server-holds #metadata #portal]]`)
};

const es_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al cerrar sesión se borran las claves del navegador primero, luego se termina la sesión del servidor y la cookie caduca. La página muestra una confirmación de cierre voluntario y vuelve al formulario de inicio de sesión. [[#portal #keys]]
**¿Qué diferencia cerrar sesión de cerrar la pestaña?** Cerrar sesión borra las claves y revoca la sesión del servidor de inmediato. El cierre por inactividad hace lo mismo. Cerrar la pestaña o navegar a otra página pone a cero las claves en el navegador pero no revoca la sesión del servidor; esa sesión caduca dentro de los veinte minutos posteriores a la última renovación. La salida rápida reemplaza la página con un destino seguro y también revoca la sesión. [En el dispositivo](#deep-dive/on-the-device) trata lo que permanece en el navegador tras la eliminación de las claves. [Salida rápida](#client-portal/quick-exit) trata la otra vía y lo que hace de forma distinta. [[#server-holds #failure-states]]
**¿Qué no oculta cerrar sesión?** El título de la pestaña no cambia y el navegador permanece en la página. Cerrar sesión no oculta que la página se visitó. Un cliente que necesita ocultarlo tiene la salida rápida. [[#privacy]]
**El manejador de cierre de sesión y la cookie.** El manejador se ejecuta contra \`accountLogout\` en \`packages/server/src/routes/client-portal.ts\`, que invoca \`logout\` en \`packages/server/src/portal/account-service.ts\`. El servidor obtiene un hash del testigo de la cookie, elimina la fila de sesión correspondiente y devuelve una cookie caducada. La eliminación es idempotente y el servidor solo registra que una sesión terminó. [[#server-holds #metadata #portal]]`)
};

const en_xa2_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgnìng òùt wìpès thè kèys ìn thè bròwsèr fìrst, thèn ènds thè sèrvèr-sìdè sèssìòn ànd èxpìrès thè còòkìè. Thè pàgè shòws à vòlùntàry sìgn-òùt cònfìrmàtìòn ànd rètùrns tò thè sìgn-ìn fòrm. [[#pòrtàl #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt sèpàràtès sìgn-òùt fròm clòsìng thè tàb? ••••••••••••••** Sìgn-òùt wìpès thè kèys ànd rèvòkès thè sèrvèr sèssìòn ìmmèdìàtèly. Thè ìdlè tìmèòùt dòès thè sàmè. Clòsìng thè tàb òr nàvìgàtìng tò ànòthèr pàgè zèròès thè kèys ìn thè bròwsèr bùt dòès nòt rèvòkè thè sèrvèr sèssìòn; thàt sèssìòn làpsès wìthìn twènty mìnùtès òf thè làst rènèwàl. Qùìck èxìt rèplàcès thè pàgè wìth à sàfè dèstìnàtìòn ànd àlsò rèvòkès thè sèssìòn. [Òn thè dèvìcè](#dèèp-dìvè/òn-thè-dèvìcè) còvèrs whàt stàys ìn thè bròwsèr àftèr thè kèys àrè gònè. [Qùìck èxìt](#clìènt-pòrtàl/qùìck-èxìt) còvèrs thè òthèr pàth ànd whàt ìt dòès dìffèrèntly. [[#sèrvèr-hòlds #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès sìgn-òùt nòt hìdè? •••••••••** Thè tàb tìtlè stàys ùnchàngèd ànd thè bròwsèr stàys òn thè pàgè. Sìgn-òùt dòès nòt còncèàl thàt thè pàgè wàs vìsìtèd. À clìènt whò nèèds còncèàlmènt hàs qùìck èxìt. [[#prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè lògòùt hàndlèr ànd thè còòkìè. •••••••••••** Thè hàndlèr rùns àgàìnst \`àccòùntLògòùt\` ìn \`pàckàgès/sèrvèr/src/ròùtès/clìènt-pòrtàl.ts\`, whìch càlls \`lògòùt\` ìn \`pàckàgès/sèrvèr/src/pòrtàl/àccòùnt-sèrvìcè.ts\`. Thè sèrvèr hàshès thè tòkèn fròm thè còòkìè, dèlètès thè màtchìng sèssìòn ròw, ànd rètùrns àn èxpìrèd còòkìè. Thè dèlètìòn ìs ìdèmpòtènt ànd thè sèrvèr lèàrns ònly thàt à sèssìòn èndèd. [[#sèrvèr-hòlds #mètàdàtà #pòrtàl]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Signing out wipes the keys in the browser first, then ends the server-side session and expires the cookie. The page shows a voluntary sign-out confirmation a..." |
*
* @param {Demo_Narrative_Client_Account_Sign_Out_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_out_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Sign_Out_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Sign_Out_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_sign_out_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_account_sign_out_body(inputs)
	return en_demo_narrative_client_account_sign_out_body(inputs)
});