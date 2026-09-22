/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_People_BodyInputs */

const en_demo_narrative_admin_people_body = /** @type {(inputs: Demo_Narrative_Admin_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The roster lists every account in the organization, active or deactivated, with the role it holds, the state of its keys and the queues it belongs to. [[#permissions #privacy]]
**What the roster reaches and what it does not.** Reading the roster, deactivating an account and handling invitations all run on the Manage users permission, while changing someone's role runs on Manage roles, so an account can administer the roster without being able to promote anyone. The server refuses a role change an account makes to its own row and refuses to demote the last active administrator. [The permission system](#deep-dive/the-permission-system) covers where those grants come from. [[#permissions]]
**Two ways an account starts.** An invite link carries a random token good for seventy-two hours and names the role the new account will hold, and the invited person chooses their own password, so their keys are derived on their own device. Creating the account directly has the administrator set the identifier and a temporary password of at least sixteen characters, and the administrator's browser derives that account's keys and wraps the organization key for it, which leaves the temporary password in two people's hands until it is changed. [How keys are derived](#deep-dive/how-keys-are-derived) covers what a password produces. [[#keys #privacy]]
**What the server keeps of an invitation.** The token is stored as a SHA-256 hash beside a copy sealed to the organization key, which is how an outstanding link can be read again by anyone holding that key. The role, the inviting account, the creation time and the expiry sit in plaintext columns, revoking writes a revocation time rather than deleting the row, and an accepted invitation is marked consumed and keeps its row. [[#server-holds #metadata]]
**What deactivation destroys.** Deactivating an account deletes its ticket key wraps, its wrapped copy of the organization key and its key row in one transaction, so it stops being able to decrypt anything at that moment. The server refuses when that account holds the only wrap for a case and reports how many cases are affected, and forcing past the refusal makes those cases unreadable to everyone. Reactivating restores the account and not the deleted key material, which \`revokeVolunteerKeys\` in \`packages/server/src/crypto/offboarding.ts\` removes for good. [[#keys #failure-states]]`)
};

const es_demo_narrative_admin_people_body = /** @type {(inputs: Demo_Narrative_Admin_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El directorio enumera todas las cuentas de la organización, activas o desactivadas, con el rol que tienen, el estado de sus claves y las colas a las que pertenecen. [[#permissions #privacy]]
**Hasta dónde llega el directorio y hasta dónde no.** Leer el directorio, desactivar una cuenta y gestionar las invitaciones dependen del permiso Gestionar usuarios, mientras que cambiar el rol de alguien depende de Gestionar roles, así que una cuenta puede administrar el directorio sin poder ascender a nadie. El servidor rechaza el cambio de rol que una cuenta hace sobre su propia fila y rechaza degradar a la última persona administradora activa. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde salen esas concesiones. [[#permissions]]
**Dos maneras de crear una cuenta.** Un enlace de invitación lleva un token aleatorio válido durante setenta y dos horas y fija el rol que tendrá la cuenta nueva, y la persona invitada elige su propia contraseña, de modo que sus claves se derivan en su propio dispositivo. Al crear la cuenta directamente, la persona administradora fija el identificador y una contraseña temporal de al menos dieciséis caracteres, y su navegador deriva las claves de esa cuenta y envuelve para ella la clave de la organización, lo que deja la contraseña temporal en manos de dos personas hasta que se cambie. [Cómo se derivan las claves](#deep-dive/how-keys-are-derived) explica qué produce una contraseña. [[#keys #privacy]]
**Lo que el servidor guarda de una invitación.** El token se guarda como un hash SHA-256 junto a una copia sellada con la clave de la organización, que es como un enlace pendiente vuelve a leerse desde cualquier cuenta que tenga esa clave. El rol, la cuenta que invitó, la fecha de creación y la de vencimiento están en columnas en texto plano, revocar escribe una fecha de revocación en lugar de borrar la fila, y una invitación aceptada queda marcada como consumida y conserva su fila. [[#server-holds #metadata]]
**Lo que destruye la desactivación.** Desactivar una cuenta borra en una sola transacción sus envoltorios de clave de ticket, su copia envuelta de la clave de la organización y su fila de claves, así que deja de poder descifrar nada en ese momento. El servidor lo rechaza cuando esa cuenta tiene el único envoltorio de un caso e indica a cuántos casos afecta, y forzar el rechazo deja esos casos ilegibles para todo el mundo. Reactivar restaura la cuenta y no el material de claves borrado, que \`revokeVolunteerKeys\`, en \`packages/server/src/crypto/offboarding.ts\`, elimina de forma definitiva. [[#keys #failure-states]]`)
};

const en_xa2_demo_narrative_admin_people_body = /** @type {(inputs: Demo_Narrative_Admin_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ròstèr shòws èvèry ùsèr ìn thè òrgànìzàtìòn wìth thèìr ròlè ànd àssìgnèd qùèùès.
 ••••••••••••••••••••••••••**Ròlè mànàgèmènt. •••••** Èàch ùsèr hòlds ònè òf thrèè ròlès. Thè fìrst twò ròlè nàmès àrè dèfàùlts thè òrgànìzàtìòn càn rènàmè ìn tèrmìnòlògy sèttìngs, whìlè thè àdmìnìstràtòr nàmè ìs fìxèd. Thè ròlè dètèrmìnès whìch pèrmìssìòns àrè gràntèd by dèfàùlt, ànd thòsè dèfàùlts àrè àdjùstàblè pèr ròlè ìn thè pèrmìssìòn màtrìx.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìnvìtàtìòns. ••••** Nèw ùsèrs àrè ìnvìtèd èìthèr by gènèràtìng àn ìnvìtè lìnk òr by crèàtìng thè àccòùnt mànùàlly, ànd à pèndìng ìnvìtàtìòn càn bè rèvòkèd bèfòrè ìt ìs àccèptèd. Thè ìnvìtèd pèrsòn còmplètès ònbòàrdìng ànd kèy gènèràtìòn òn thèìr òwn dèvìcè.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Vìèwìng ànd mànàgìng thè ròstèr rèqùìrès thè Mànàgè ùsèrs pèrmìssìòn. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The roster lists every account in the organization, active or deactivated, with the role it holds, the state of its keys and the queues it belongs to. [[#per..." |
*
* @param {Demo_Narrative_Admin_People_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_people_body = /** @type {((inputs?: Demo_Narrative_Admin_People_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_People_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_people_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_people_body(inputs)
	return en_demo_narrative_admin_people_body(inputs)
});