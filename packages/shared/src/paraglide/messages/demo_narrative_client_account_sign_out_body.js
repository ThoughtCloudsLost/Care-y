/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Sign_Out_BodyInputs */

const en_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Signing out ends the server-side session, expires the cookie and zeroes the keys the tab holds. The page returns to the sign-in form. [[#portal #keys]]
**What separates sign-out from closing the tab?** The idle timeout, a closed tab and navigating to another page all zero the keys in the browser and revoke the server session. Sign-out returns to the sign-in form on the same page. Quick exit replaces the page with a safe destination. The session ends in every case. [On the device](#deep-dive/on-the-device) covers what stays in the browser after the keys are gone. [Quick exit](#client-portal/quick-exit) covers the other path and what it does differently. [[#server-holds #failure-states]]
**What does sign-out not hide?** The tab title stays unchanged and the browser stays on the page. Sign-out does not conceal that the page was visited. A client who needs concealment has quick exit. [[#privacy]]
**The logout handler and the cookie.** The handler runs against \`accountLogout\` in \`packages/server/src/routes/client-portal.ts\`, which calls \`logout\` in \`packages/server/src/portal/account-service.ts\`. The server hashes the token from the cookie, deletes the matching session row, and returns an expired cookie. The deletion is idempotent and the server learns only that a session ended. [[#server-holds #metadata #portal]]`)
};

const es_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al cerrar sesión se termina la sesión del servidor, la cookie caduca y se ponen a cero las claves que tiene la pestaña. La página vuelve al formulario de inicio de sesión. [[#portal #keys]]
**¿Qué diferencia cerrar sesión de cerrar la pestaña?** El cierre por inactividad, una pestaña cerrada y navegar a otra página ponen a cero las claves en el navegador y revocan la sesión del servidor. Cerrar sesión vuelve al formulario de inicio de sesión en la misma página. La salida rápida reemplaza la página con un destino seguro. La sesión termina en todos los casos. [En el dispositivo](#deep-dive/on-the-device) trata lo que permanece en el navegador tras la eliminación de las claves. [Salida rápida](#client-portal/quick-exit) trata la otra vía y lo que hace de forma distinta. [[#server-holds #failure-states]]
**¿Qué no oculta cerrar sesión?** El título de la pestaña no cambia y el navegador permanece en la página. Cerrar sesión no oculta que la página se visitó. Un cliente que necesita ocultarlo tiene la salida rápida. [[#privacy]]
**El manejador de cierre de sesión y la cookie.** El manejador se ejecuta contra \`accountLogout\` en \`packages/server/src/routes/client-portal.ts\`, que invoca \`logout\` en \`packages/server/src/portal/account-service.ts\`. El servidor obtiene un hash del testigo de la cookie, elimina la fila de sesión correspondiente y devuelve una cookie caducada. La eliminación es idempotente y el servidor solo registra que una sesión terminó. [[#server-holds #metadata #portal]]`)
};

const en_xa2_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgnìng òùt ènds thè sèrvèr-sìdè sèssìòn, èxpìrès thè còòkìè ànd zèròès thè kèys thè tàb hòlds. Thè pàgè rètùrns tò thè sìgn-ìn fòrm. [[#pòrtàl #kèys]]
 ••••••••••••••••••••••••••••••••••••••••••••••**Whàt sèpàràtès sìgn-òùt fròm clòsìng thè tàb? ••••••••••••••** Thè ìdlè tìmèòùt, à clòsèd tàb ànd nàvìgàtìng tò ànòthèr pàgè àll zèrò thè kèys ìn thè bròwsèr ànd rèvòkè thè sèrvèr sèssìòn. Sìgn-òùt rètùrns tò thè sìgn-ìn fòrm òn thè sàmè pàgè. Qùìck èxìt rèplàcès thè pàgè wìth à sàfè dèstìnàtìòn. Thè sèssìòn ènds ìn èvèry càsè. [Òn thè dèvìcè](#dèèp-dìvè/òn-thè-dèvìcè) còvèrs whàt stàys ìn thè bròwsèr àftèr thè kèys àrè gònè. [Qùìck èxìt](#clìènt-pòrtàl/qùìck-èxìt) còvèrs thè òthèr pàth ànd whàt ìt dòès dìffèrèntly. [[#sèrvèr-hòlds #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès sìgn-òùt nòt hìdè? •••••••••** Thè tàb tìtlè stàys ùnchàngèd ànd thè bròwsèr stàys òn thè pàgè. Sìgn-òùt dòès nòt còncèàl thàt thè pàgè wàs vìsìtèd. À clìènt whò nèèds còncèàlmènt hàs qùìck èxìt. [[#prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè lògòùt hàndlèr ànd thè còòkìè. •••••••••••** Thè hàndlèr rùns àgàìnst \`àccòùntLògòùt\` ìn \`pàckàgès/sèrvèr/src/ròùtès/clìènt-pòrtàl.ts\`, whìch càlls \`lògòùt\` ìn \`pàckàgès/sèrvèr/src/pòrtàl/àccòùnt-sèrvìcè.ts\`. Thè sèrvèr hàshès thè tòkèn fròm thè còòkìè, dèlètès thè màtchìng sèssìòn ròw, ànd rètùrns àn èxpìrèd còòkìè. Thè dèlètìòn ìs ìdèmpòtènt ànd thè sèrvèr lèàrns ònly thàt à sèssìòn èndèd. [[#sèrvèr-hòlds #mètàdàtà #pòrtàl]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Signing out ends the server-side session, expires the cookie and zeroes the keys the tab holds. The page returns to the sign-in form. [[#portal #keys]] **Wha..." |
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