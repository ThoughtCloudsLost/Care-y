/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A password alone is not enough to access case data. Every sign-in also requires a second factor to confirm identity through a separate channel.
Five methods are available: authenticator apps, passkeys, email codes, SMS codes, and push approval. Multiple methods can be enrolled simultaneously, and each works independently. The system generates a set of one-time backup codes at first enrollment. The last remaining method cannot be removed.
**Encryption.** Until a second-factor check is completed, the session cannot read any encrypted case data, even if the password was correct.`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una contraseña por sí sola no basta para acceder a los datos de los casos. Cada inicio de sesión también requiere un segundo factor para confirmar la identidad a través de un canal separado.
Hay cinco métodos disponibles: aplicaciones de autenticación, passkeys, códigos por correo electrónico, códigos por SMS y aprobación push. Se pueden inscribir varios métodos simultáneamente, y cada uno funciona de forma independiente. El sistema genera un conjunto de códigos de respaldo de un solo uso con la primera inscripción. El último método restante no se puede eliminar.
**Cifrado.** Hasta que se completa una verificación de segundo factor, la sesión no puede leer ningún dato cifrado de los casos, aunque la contraseña haya sido correcta.`)
};

const en_xa2_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À pàsswòrd àlònè ìs nòt ènòùgh tò àccèss càsè dàtà. Èvèry sìgn-ìn àlsò rèqùìrès à sècònd fàctòr tò cònfìrm ìdèntìty thròùgh à sèpàràtè chànnèl.
Fìvè mèthòds àrè àvàìlàblè: àùthèntìcàtòr àpps, pàsskèys, èmàìl còdès, SMS còdès, ànd pùsh àppròvàl. Mùltìplè mèthòds càn bè ènròllèd sìmùltànèòùsly, ànd èàch wòrks ìndèpèndèntly. Thè systèm gènèràtès à sèt òf ònè-tìmè bàckùp còdès àt fìrst ènròllmènt. Thè làst rèmàìnìng mèthòd cànnòt bè rèmòvèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Ùntìl à sècònd-fàctòr chèck ìs còmplètèd, thè sèssìòn cànnòt rèàd àny èncryptèd càsè dàtà, èvèn ìf thè pàsswòrd wàs còrrèct. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A password alone is not enough to access case data. Every sign-in also requires a second factor to confirm identity through a separate channel. Five methods ..." |
*
* @param {Demo_Narrative_Topic_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_body(inputs)
	return en_demo_narrative_topic_twofa_body(inputs)
});