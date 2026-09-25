/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Sign_Out_BodyInputs */

const en_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Signing out deletes the session row on the server, expires the browser's cookie, zeroes the keys the tab was holding and returns the page to the sign-in form. [[#portal #keys]]
**What it does that leaving does not.** Closing the tab, navigating away and the idle timeout all stop at the browser: the keys go, and the session stays valid on the server until its own twenty-four hours run out. Signing out and quick exit are the two paths that tell the server to end it now. [Quick exit](#client-portal/quick-exit) covers the other one and the difference between them. [[#server-holds #failure-states]]
**Why it does not hide the visit.** It leaves the tab title alone and sends the browser nowhere, because its job is to end a session in the open rather than to conceal that the page was used. A client who needs the second thing has quick exit. [[#privacy]]
**What the server is told.** One request naming the session token's hash, which lets the server delete that row and tells it nothing about why. The deletion is idempotent, so a repeat is not an error and not a signal. [[#server-holds #metadata]]
**The logout path.** The handler is on the account page against \`accountLogout\` in \`packages/server/src/routes/client-portal.ts\`, which calls \`logout\` in \`packages/server/src/portal/account-service.ts\` and sets an expired cookie on the way out. [[#server-holds #portal]]`)
};

const es_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar sesión elimina la fila de la sesión en el servidor, caduca la cookie del navegador, pone a cero las claves que tenía la pestaña y devuelve la página al formulario de inicio de sesión. [[#portal #keys]]
**Lo que hace y que irse no hace.** Cerrar la pestaña, navegar a otro sitio y el cierre por inactividad se quedan en el navegador: las claves desaparecen y la sesión sigue siendo válida en el servidor hasta que se agotan sus veinticuatro horas. Cerrar sesión y la salida rápida son las dos vías que le piden al servidor que la termine ya. [Salida rápida](#client-portal/quick-exit) trata la otra y la diferencia entre ambas. [[#server-holds #failure-states]]
**Por qué no oculta la visita.** Deja intacto el título de la pestaña y no envía el navegador a ninguna parte, porque su función es terminar una sesión a la vista y no ocultar que la página se usó. Un cliente que necesita lo segundo tiene la salida rápida. [[#privacy]]
**Lo que se le comunica al servidor.** Una sola solicitud que nombra el hash del testigo de sesión, lo que permite al servidor eliminar esa fila y no le dice nada sobre el motivo. La eliminación es idempotente, así que repetirla no es un error ni una señal. [[#server-holds #metadata]]
**La ruta de cierre de sesión.** El manejador está en la página de la cuenta, contra \`accountLogout\`, en \`packages/server/src/routes/client-portal.ts\`, que invoca \`logout\`, en \`packages/server/src/portal/account-service.ts\`, y fija una cookie caducada al salir. [[#server-holds #portal]]`)
};

const en_xa2_demo_narrative_client_account_sign_out_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgnìng òùt dèlètès thè sèssìòn ròw òn thè sèrvèr, èxpìrès thè bròwsèr's còòkìè, zèròès thè kèys thè tàb wàs hòldìng ànd rètùrns thè pàgè tò thè sìgn-ìn fòrm. [[#pòrtàl #kèys]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt ìt dòès thàt lèàvìng dòès nòt. •••••••••••** Clòsìng thè tàb, nàvìgàtìng àwày ànd thè ìdlè tìmèòùt àll stòp àt thè bròwsèr: thè kèys gò, ànd thè sèssìòn stàys vàlìd òn thè sèrvèr ùntìl ìts òwn twènty-fòùr hòùrs rùn òùt. Sìgnìng òùt ànd qùìck èxìt àrè thè twò pàths thàt tèll thè sèrvèr tò ènd ìt nòw. [Qùìck èxìt](#clìènt-pòrtàl/qùìck-èxìt) còvèrs thè òthèr ònè ànd thè dìffèrèncè bètwèèn thèm. [[#sèrvèr-hòlds #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why ìt dòès nòt hìdè thè vìsìt. ••••••••••** Ìt lèàvès thè tàb tìtlè àlònè ànd sènds thè bròwsèr nòwhèrè, bècàùsè ìts jòb ìs tò ènd à sèssìòn ìn thè òpèn ràthèr thàn tò còncèàl thàt thè pàgè wàs ùsèd. À clìènt whò nèèds thè sècònd thìng hàs qùìck èxìt. [[#prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr ìs tòld. ••••••••** Ònè rèqùèst nàmìng thè sèssìòn tòkèn's hàsh, whìch lèts thè sèrvèr dèlètè thàt ròw ànd tèlls ìt nòthìng àbòùt why. Thè dèlètìòn ìs ìdèmpòtènt, sò à rèpèàt ìs nòt àn èrròr ànd nòt à sìgnàl. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè lògòùt pàth. •••••** Thè hàndlèr ìs òn thè àccòùnt pàgè àgàìnst \`àccòùntLògòùt\` ìn \`pàckàgès/sèrvèr/src/ròùtès/clìènt-pòrtàl.ts\`, whìch càlls \`lògòùt\` ìn \`pàckàgès/sèrvèr/src/pòrtàl/àccòùnt-sèrvìcè.ts\` ànd sèts àn èxpìrèd còòkìè òn thè wày òùt. [[#sèrvèr-hòlds #pòrtàl]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Signing out deletes the session row on the server, expires the browser's cookie, zeroes the keys the tab was holding and returns the page to the sign-in form..." |
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