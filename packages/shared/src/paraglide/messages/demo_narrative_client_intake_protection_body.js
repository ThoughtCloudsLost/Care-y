/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Protection_BodyInputs */

const en_demo_narrative_client_intake_protection_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Protection_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The page states what it protects before the visitor types anything, because the decision it asks for is whether typing here is safe at all. Every value is encrypted in the browser, the server receives ciphertext it holds no key for, and nobody outside the organization can open it. [[#privacy #encryption]]
**Who can open a fresh submission.** A submission arrives with no relationship to any particular person in the organization, so its key is sealed to the organization's public key and every holder of the organization's private key can open it. Once someone first opens the case, the key is re-wrapped for the people working it and the organization-wide wrap is deleted, so access narrows from that moment and does not narrow before it. [How encryption works](#deep-dive/how-encryption-works) covers the organization key. [[#keys #permissions]]
**When the per-person wraps are minted.** Nothing is wrapped per person at submission time. The first open converts the sealed wrap into one wrap per queue member and per holder of the intake-response permission, and a later request can mint wraps for principals a conversion missed, which is how someone added to the queue afterward gains a key without the visitor being involved. [The permission system](#deep-dive/the-permission-system) covers who those holders are. [[#keys #permissions]]
**What the server is left with.** The row carries the ciphertext, the sealed key, a generated alias for the new client record and the timestamps of the writes. A database dump shows that a submission happened, when, and which queue it landed in, and none of what was said. [The trust boundary](#deep-dive/the-trust-boundary) covers what else stays readable in the schema. [[#server-holds #metadata]]
**The seal, the conversion and the interim row.** The browser seals the per-submission key in \`encryptIntake\` in \`packages/client/src/routes/(client)/intake/intake-crypto.ts\`, the server stores it in \`intake_key_wraps\` from \`packages/server/src/db/migrations/tenant/089_intake_forms.ts\`, and \`packages/server/src/portal/intake-conversion-service.ts\` replaces it with per-holder wraps and deletes the interim row in one transaction. The later minting path is \`backfillWraps\` in \`packages/server/src/portal/intake-response-service.ts\`. [[#keys #server-holds]]`)
};

const es_demo_narrative_client_intake_protection_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Protection_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página declara qué protege antes de que el visitante escriba nada, porque la decisión que le pide es si escribir aquí es seguro. Cada valor se cifra en el navegador, el servidor recibe texto cifrado para el que no tiene ninguna clave y nadie fuera de la organización puede abrirlo. [[#privacy #encryption]]
**Quién puede abrir un envío recién llegado.** Un envío llega sin relación con ninguna persona concreta de la organización, así que su clave se sella con la clave pública de la organización y cualquiera que tenga la clave privada de la organización puede abrirlo. Cuando alguien abre el caso por primera vez, la clave se vuelve a envolver para las personas que lo trabajan y se elimina la envoltura de toda la organización, de modo que el acceso se restringe a partir de ese momento y no antes. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización. [[#keys #permissions]]
**Cuándo se acuñan las envolturas por persona.** En el momento del envío no se envuelve nada por persona. La primera apertura convierte la envoltura sellada en una envoltura por cada miembro de la cola y por cada titular del permiso de respuestas de admisión, y una petición posterior puede acuñar envolturas para los principales que una conversión no cubrió, que es como alguien añadido a la cola después obtiene una clave sin que el visitante intervenga. [El sistema de permisos](#deep-dive/the-permission-system) trata quiénes son esos titulares. [[#keys #permissions]]
**Con qué se queda el servidor.** La fila lleva el texto cifrado, la clave sellada, un alias generado para el nuevo registro de cliente y las marcas de tiempo de las escrituras. Un volcado de la base de datos muestra que hubo un envío, cuándo y en qué cola cayó, y nada de lo que se dijo. [La frontera de confianza](#deep-dive/the-trust-boundary) trata qué más queda legible en el esquema. [[#server-holds #metadata]]
**El sellado, la conversión y la fila interina.** El navegador sella la clave de cada envío en \`encryptIntake\`, en \`packages/client/src/routes/(client)/intake/intake-crypto.ts\`; el servidor la guarda en \`intake_key_wraps\`, de \`packages/server/src/db/migrations/tenant/089_intake_forms.ts\`; y \`packages/server/src/portal/intake-conversion-service.ts\` la sustituye por envolturas por titular y elimina la fila interina en una sola transacción. La vía de acuñación posterior es \`backfillWraps\`, en \`packages/server/src/portal/intake-response-service.ts\`. [[#keys #server-holds]]`)
};

const en_xa2_demo_narrative_client_intake_protection_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Protection_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ìntàkè fòrm èncrypts èvèry vàlùè thè vìsìtòr typès bèfòrè ìt lèàvès thè bròwsèr, thè sèrvèr cànnòt rèàd thè ànswèrs àt àny pòìnt, ànd nòbòdy òùtsìdè thè òrgànìzàtìòn càn. À frèsh sùbmìssìòn ìs sèàlèd sò thàt ànyònè ìn thè òrgànìzàtìòn càn òpèn ìt, bècàùsè thè vìsìtòr hàs nò rèlàtìònshìp tò àny spècìfìc pèrsòn yèt, ànd òncè sòmèònè pìcks thè càsè ùp thè àccèss nàrròws tò thè pèòplè wòrkìng ìt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why ìt màttèrs. •••••** Thè vìsìtòr sèès thìs èxplànàtìòn bèfòrè èntèrìng àny ìnfòrmàtìòn, ànd à pèrsòn fìllìng òùt à fòrm fòr à sènsìtìvè sèrvìcè nèèds tò knòw whèthèr typìng ìntò thìs pàgè ìs sàfè bèfòrè thèy stàrt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The page states what it protects before the visitor types anything, because the decision it asks for is whether typing here is safe at all. Every value is en..." |
*
* @param {Demo_Narrative_Client_Intake_Protection_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_protection_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Protection_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Protection_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_protection_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_protection_body(inputs)
	return en_demo_narrative_client_intake_protection_body(inputs)
});