/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_General_BodyInputs */

const en_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`General information holds the organization's name, the country its phone numbers belong to, the language it starts people in, and the address the client-facing quick exit leads to, and all four are stored without encryption. [[#server-holds]]
**What each of the four reaches.** The name appears on pages a visitor sees before anyone signs in, which is the reason it is held in the clear. The country code completes a phone number typed without an international prefix when an account enrolls a phone for sign-in codes. The language decides which language the server writes in when it composes text on its own, the footer added to a reply-by-email message and the portal notice a client receives. The exit address becomes the destination a client-facing page leaves for. [Quick exit](#client-portal/quick-exit) covers what leaving does to the session. [[#portal #telephony]]
**Why the exit address is checked twice.** A stored address has to be an absolute https URL with a real hostname, because the value becomes the navigation a person performs when they need to leave fast, and a permissive URL check accepts schemes that run script instead of loading a page. The same check runs again on the way out, so a value that predates the rule or arrives by a path that skipped it falls back to the built-in destination rather than being used as stored. [[#failure-states #portal]]
**What the row gives away.** A database dump shows the organization's name, its country, its working language and the address it sends someone to on the way out. The name is already public on the pages an anonymous visitor reaches, so the three that are new to a dump are the country, the language and the exit address. [The trust boundary](#deep-dive/the-trust-boundary) covers what else the server holds in the clear. [[#server-holds #metadata]]
**Who can change these four.** Editing general information requires the Manage organization identity permission, which sits with Admin by default and can be moved to another role. [The permission system](#deep-dive/the-permission-system) covers how a grant moves. [[#permissions]]
**One name column with two readers.** The organization name here and the display name under branding are the same column, \`org_config.name\`, so a change made here is the change branding shows rather than a second write kept in step with the first. The read and write path is \`getOrgGeneral\` and \`updateOrgGeneral\` in \`packages/server/src/org/org-config-service.ts\` behind permission-gated procedures in \`packages/server/src/routes/org.ts\`, the scheme rule is \`safeExitUrlSchema\` in \`packages/shared/src/schemas/org.ts\`, and the second check on the way out is \`readSafeExitUrl\` in \`packages/server/src/branding/branding-service.ts\`. [Branding](#admin-org/branding) covers the rest of that row. [[#server-holds]]`)
};

const es_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La información general guarda el nombre de la organización, el país al que pertenecen sus números de teléfono, el idioma en el que empieza a atender a las personas y la dirección a la que lleva la salida rápida de las páginas para clientes, y las cuatro se almacenan sin cifrar. [[#server-holds]]
**A qué llega cada una de las cuatro.** El nombre aparece en páginas que un visitante ve antes de que nadie inicie sesión, y por eso se guarda en claro. El código de país completa un número de teléfono escrito sin prefijo internacional cuando una cuenta inscribe un teléfono para recibir códigos de acceso. El idioma decide en qué lengua escribe el servidor cuando redacta texto por su cuenta, el pie que se añade a un mensaje de respuesta por correo y el aviso del portal que recibe un cliente. La dirección de salida es el destino al que se va una página para clientes. [Salida rápida](#client-portal/quick-exit) trata lo que la salida le hace a la sesión. [[#portal #telephony]]
**Por qué la dirección de salida se comprueba dos veces.** Una dirección almacenada tiene que ser una URL https absoluta con un nombre de host real, porque ese valor se convierte en la navegación que hace una persona cuando necesita salir deprisa, y una comprobación de URL permisiva acepta esquemas que ejecutan código en lugar de cargar una página. La misma comprobación se repite al leerla, de modo que un valor anterior a la regla, o que llegue por una vía que se la saltó, cae en el destino integrado en lugar de usarse tal como está almacenado. [[#failure-states #portal]]
**Qué revela esa fila.** Un volcado de la base de datos muestra el nombre de la organización, su país, su idioma de trabajo y la dirección a la que envía a alguien que se va. El nombre ya es público en las páginas a las que llega un visitante anónimo, así que lo nuevo en un volcado son el país, el idioma y la dirección de salida. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo demás que el servidor guarda en claro. [[#server-holds #metadata]]
**Quién puede cambiar las cuatro.** Editar la información general requiere el permiso de gestionar la identidad de la organización, que corresponde a Admin de forma predeterminada y puede pasarse a otro rol. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo se traslada una concesión. [[#permissions]]
**Una columna de nombre con dos lectores.** El nombre de la organización aquí y el nombre visible en la marca son la misma columna, \`org_config.name\`, así que un cambio hecho aquí es el cambio que muestra la marca y no una segunda escritura que haya que mantener acompasada con la primera. La vía de lectura y escritura son \`getOrgGeneral\` y \`updateOrgGeneral\`, en \`packages/server/src/org/org-config-service.ts\`, detrás de procedimientos con permiso en \`packages/server/src/routes/org.ts\`; la regla de esquema es \`safeExitUrlSchema\`, en \`packages/shared/src/schemas/org.ts\`; y la segunda comprobación al leer es \`readSafeExitUrl\`, en \`packages/server/src/branding/branding-service.ts\`. [Marca](#admin-org/branding) trata el resto de esa fila. [[#server-holds]]`)
};

const en_xa2_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè gènèràl ìnfò sèctìòn hòlds thè òrgànìzàtìòn nàmè, còùntry còdè, dèfàùlt ìntèrfàcè làngùàgè, ànd pòrtàl sàfè èxìt ÙRL, ànd àll fòùr àrè stòrèd às plàìntèxt.
 ••••••••••••••••••••••••••••••••••••••••••••••••**Sàfè èxìt ÙRL. •••••** Thè sèrvèr vàlìdàtès thè ÙRL schèmè òn rèàd às wèll às òn wrìtè, bècàùsè thè vàlùè bècòmès thè dèstìnàtìòn òf à nàvìgàtìòn thàt rèplàcès thè pàgè òn thè clìènt qùìck èxìt pàth. À stòrèd vàlùè thàt fàìls vàlìdàtìòn fàlls bàck tò thè clìènt dèfàùlt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Chàngìng thè òrgànìzàtìòn nàmè àlsò ùpdàtès thè bràndìng dìsplày nàmè sò thè twò stày cònsìstènt.
 ••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Èdìtìng gènèràl ìnfò rèqùìrès thè Mànàgè òrgànìzàtìòn ìdèntìty pèrmìssìòn. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "General information holds the organization's name, the country its phone numbers belong to, the language it starts people in, and the address the client-faci..." |
*
* @param {Demo_Narrative_Admin_General_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_general_body = /** @type {((inputs?: Demo_Narrative_Admin_General_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_General_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_general_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_general_body(inputs)
	return en_demo_narrative_admin_general_body(inputs)
});