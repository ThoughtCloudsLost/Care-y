/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Email_BodyInputs */

const en_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six-digit code is sent to the email address on the account. It is valid for five minutes. A third wrong entry deletes the code rather than locking the account, so the next attempt starts from a fresh code. [[#failure-states #privacy]]
**Why can the server read the address?** The email address is encrypted under the server's operational key, not under the organization's end-to-end key. The server holds that key, so the running server can read the address back at any time. That is what allows it to send anything to the address. The encryption protects the address in a database dump or backup taken without the key. It does not protect the address from the server itself. This is a deliberate exception to the rule that the server holds only data it cannot open, and it applies only to delivery addresses the server acts on. [The trust boundary](#deep-dive/the-trust-boundary) covers the full scope of that exception. [[#trust-boundary #server-holds]]
**Rate limits on requesting a code.** One code per minute per account, and five in an hour. Beyond either limit the request is refused. The response includes the wait time. The limit exists to prevent a stolen password from flooding an inbox with sign-in codes. [[#failure-states]]
**Mailbox as the weak point.** The account is only as protected as the mailbox the address points to. Anyone who can read that mailbox can complete a sign-in with a password they already have. This method suits accounts whose mailbox is itself protected by something stronger. [[#privacy #trust-boundary]]
**Email code generation and storage.** Generation, hashing, expiry, and attempt counting are in \`packages/server/src/auth/email-code.ts\`. The code row is \`packages/server/src/db/migrations/tenant/008_create_email_codes.ts\`. The stored address is the \`users.encrypted_notification_addr\` column from \`packages/server/src/db/migrations/tenant/001_create_users.ts\`, read back through the field encryptor in \`packages/server/src/auth/two-factor-service.ts\`. [[#server-holds]]`)
};

const es_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envía un código de seis dígitos a la dirección de correo registrada en la cuenta. Es válido durante cinco minutos. Un tercer intento incorrecto elimina el código en lugar de bloquear la cuenta, de modo que el siguiente intento parte de un código nuevo. [[#failure-states #privacy]]
**¿Por qué el servidor puede leer la dirección?** La dirección de correo electrónico está cifrada bajo la clave operativa del servidor, no bajo la clave de cifrado de extremo a extremo de la organización. El servidor posee esa clave, por lo que puede leer la dirección en cualquier momento. Eso es lo que le permite enviar cualquier cosa a esa dirección. El cifrado protege la dirección en un volcado de base de datos o una copia de seguridad tomada sin la clave. No protege la dirección del propio servidor. Esta es una excepción deliberada a la regla de que el servidor solo almacena datos que no puede abrir, y se aplica únicamente a direcciones de entrega sobre las que el servidor actúa. [El límite de confianza](#deep-dive/the-trust-boundary) cubre el alcance completo de esa excepción. [[#trust-boundary #server-holds]]
**Límites de frecuencia para solicitar un código.** Un código por minuto por cuenta, y cinco en una hora. Superado cualquiera de los dos límites, la solicitud se rechaza. La respuesta incluye el tiempo de espera. El límite existe para evitar que una contraseña robada inunde una bandeja de entrada con códigos de inicio de sesión. [[#failure-states]]
**El buzón como punto débil.** La cuenta solo está tan protegida como el buzón al que apunta la dirección. Cualquier persona que pueda leer ese buzón puede completar un inicio de sesión con una contraseña que ya tenga. Este método conviene a cuentas cuyo buzón está a su vez protegido por algo más fuerte. [[#privacy #trust-boundary]]
**Generación y almacenamiento del código de correo.** La generación, el hashing, la expiración y el conteo de intentos están en \`packages/server/src/auth/email-code.ts\`. La fila del código está en \`packages/server/src/db/migrations/tenant/008_create_email_codes.ts\`. La dirección almacenada es la columna \`users.encrypted_notification_addr\` de \`packages/server/src/db/migrations/tenant/001_create_users.ts\`, leída a través del cifrador de campos en \`packages/server/src/auth/two-factor-service.ts\`. [[#server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À sìx-dìgìt còdè ìs sènt tò thè èmàìl àddrèss òn thè àccòùnt. Ìt ìs vàlìd fòr fìvè mìnùtès. À thìrd wròng èntry dèlètès thè còdè ràthèr thàn lòckìng thè àccòùnt, sò thè nèxt àttèmpt stàrts fròm à frèsh còdè. [[#fàìlùrè-stàtès #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why càn thè sèrvèr rèàd thè àddrèss? •••••••••••** Thè èmàìl àddrèss ìs èncryptèd ùndèr thè sèrvèr's òpèràtìònàl kèy, nòt ùndèr thè òrgànìzàtìòn's ènd-tò-ènd kèy. Thè sèrvèr hòlds thàt kèy, sò thè rùnnìng sèrvèr càn rèàd thè àddrèss bàck àt àny tìmè. Thàt ìs whàt àllòws ìt tò sènd ànythìng tò thè àddrèss. Thè èncryptìòn pròtècts thè àddrèss ìn à dàtàbàsè dùmp òr bàckùp tàkèn wìthòùt thè kèy. Ìt dòès nòt pròtèct thè àddrèss fròm thè sèrvèr ìtsèlf. Thìs ìs à dèlìbèràtè èxcèptìòn tò thè rùlè thàt thè sèrvèr hòlds ònly dàtà ìt cànnòt òpèn, ànd ìt àpplìès ònly tò dèlìvèry àddrèssès thè sèrvèr àcts òn. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs thè fùll scòpè òf thàt èxcèptìòn. [[#trùst-bòùndàry #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ràtè lìmìts òn rèqùèstìng à còdè. ••••••••••** Ònè còdè pèr mìnùtè pèr àccòùnt, ànd fìvè ìn àn hòùr. Bèyònd èìthèr lìmìt thè rèqùèst ìs rèfùsèd. Thè rèspònsè ìnclùdès thè wàìt tìmè. Thè lìmìt èxìsts tò prèvènt à stòlèn pàsswòrd fròm flòòdìng àn ìnbòx wìth sìgn-ìn còdès. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Màìlbòx às thè wèàk pòìnt. ••••••••** Thè àccòùnt ìs ònly às pròtèctèd às thè màìlbòx thè àddrèss pòìnts tò. Ànyònè whò càn rèàd thàt màìlbòx càn còmplètè à sìgn-ìn wìth à pàsswòrd thèy àlrèàdy hàvè. Thìs mèthòd sùìts àccòùnts whòsè màìlbòx ìs ìtsèlf pròtèctèd by sòmèthìng stròngèr. [[#prìvàcy #trùst-bòùndàry]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èmàìl còdè gènèràtìòn ànd stòràgè. •••••••••••** Gènèràtìòn, hàshìng, èxpìry, ànd àttèmpt còùntìng àrè ìn \`pàckàgès/sèrvèr/src/àùth/èmàìl-còdè.ts\`. Thè còdè ròw ìs \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/008_crèàtè_èmàìl_còdès.ts\`. Thè stòrèd àddrèss ìs thè \`ùsèrs.èncryptèd_nòtìfìcàtìòn_àddr\` còlùmn fròm \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_crèàtè_ùsèrs.ts\`, rèàd bàck thròùgh thè fìèld èncryptòr ìn \`pàckàgès/sèrvèr/src/àùth/twò-fàctòr-sèrvìcè.ts\`. [[#sèrvèr-hòlds]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A six-digit code is sent to the email address on the account. It is valid for five minutes. A third wrong entry deletes the code rather than locking the acco..." |
*
* @param {Demo_Narrative_Topic_Twofa_Email_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_email_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Email_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Email_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_email_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_email_body(inputs)
	return en_demo_narrative_topic_twofa_email_body(inputs)
});