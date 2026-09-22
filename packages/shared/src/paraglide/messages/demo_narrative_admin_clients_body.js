/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Clients_BodyInputs */

const en_demo_narrative_admin_clients_body = /** @type {(inputs: Demo_Narrative_Admin_Clients_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The client list carries every client record the organization holds, twenty-five at a time, with the number of cases attached to each one. [[#client-data #permissions]]
**What the server can read about a client.** The alias is organization-key ciphertext the browser opens, so a database dump holds no names. The phone number and the email address are encrypted with a key the server holds, because the server is what dials the number and sends the mail, and that is the one part of a client record it can read. [The trust boundary](#deep-dive/the-trust-boundary) covers why the two are on different keys. [[#encryption #server-holds]]
**What a contact detail becomes without the permission.** The server decrypts the number, returns the last four digits behind three asterisks and zeros the buffer on the way out, and only an account holding View client PII gets the full value. The masked form is built server side, so a masked row never carried the whole number to the browser in the first place. [[#privacy #permissions]]
**Who may change what.** Reading the list needs View clients, renaming a record needs Edit client alias, and changing a phone number or an email address needs Edit client contact or an existing case with that client, which is what lets someone answering a case correct a number without being given every record. Deleting a client removes the client and their cases and writes an audit row carrying counts. [Audit log](#admin-logs/audit) covers what that row holds. [[#permissions #client-data]]
**What search reaches.** A search term is hashed with the organization key and matched exactly against the stored alias hash, which searches every record without the server learning the term. Anything short of an exact alias narrows the pages already loaded, so a partial name finds what has been fetched and no more. A record acquires its hash the first time a session decrypts its alias, so coverage follows use. [[#privacy #metadata]]
**Records merged away.** A record merged into another is left out of the list until it is asked for, and it keeps its own cases and its own row. [Merging clients](#admin-people/client-merge) covers what a merge changes. [[#client-data]]`)
};

const es_demo_narrative_admin_clients_body = /** @type {(inputs: Demo_Narrative_Admin_Clients_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de clientes recoge todos los registros de clientes que tiene la organización, de veinticinco en veinticinco, con el número de casos asociado a cada uno. [[#client-data #permissions]]
**Lo que el servidor puede leer de un cliente.** El alias es texto cifrado con la clave de la organización que abre el navegador, así que un volcado de la base de datos no contiene ningún nombre. El número de teléfono y la dirección de correo están cifrados con una clave que tiene el servidor, porque el servidor es quien marca el número y envía el correo, y esa es la única parte de un registro de cliente que puede leer. [La frontera de confianza](#deep-dive/the-trust-boundary) explica por qué los dos están en claves distintas. [[#encryption #server-holds]]
**En qué queda un dato de contacto sin el permiso.** El servidor descifra el número, devuelve los últimos cuatro dígitos detrás de tres asteriscos y pone a cero el búfer al salir, y solo una cuenta con Ver datos personales del cliente recibe el valor completo. La forma enmascarada se construye en el servidor, de modo que una fila enmascarada nunca llevó el número entero al navegador. [[#privacy #permissions]]
**Quién puede cambiar qué.** Leer la lista requiere Ver clientes, cambiar el nombre de un registro requiere Editar alias del cliente, y cambiar un número de teléfono o una dirección de correo requiere Editar contacto del cliente o un caso existente con ese cliente, que es lo que permite corregir un número desde un caso sin recibir todos los registros. Eliminar un cliente borra al cliente y sus casos y escribe una fila de auditoría con recuentos. [Registro de auditoría](#admin-logs/audit) trata lo que guarda esa fila. [[#permissions #client-data]]
**Hasta dónde llega la búsqueda.** Un término de búsqueda se convierte en un hash con la clave de la organización y se compara de forma exacta con el hash de alias guardado, lo que recorre todos los registros sin que el servidor conozca el término. Cualquier cosa que no sea un alias exacto acota las páginas ya cargadas, así que un nombre parcial encuentra lo que se ha recibido y nada más. Un registro obtiene su hash la primera vez que una sesión descifra su alias, de modo que la cobertura sigue al uso. [[#privacy #metadata]]
**Registros fusionados.** Un registro fusionado en otro queda fuera de la lista hasta que se pide, y conserva sus propios casos y su propia fila. [Fusionar clientes](#admin-people/client-merge) trata qué cambia una fusión. [[#client-data]]`)
};

const en_xa2_demo_narrative_admin_clients_body = /** @type {(inputs: Demo_Narrative_Admin_Clients_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè clìènt lìst shòws àll clìènts whò hàvè còntàctèd thè òrgànìzàtìòn, ànd èàch rècòrd lìnks tò thè clìènt's àssòcìàtèd tìckèts.
 •••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Clìènt ìdèntìfìèrs àrè èncryptèd wìth thè òrgànìzàtìòn kèy bèfòrè stòràgè, sò thè sèrvèr cànnòt rèàd thèm ànd à dàtàbàsè brèàch rèvèàls nò nàmès.
 •••••••••••••••••••••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thè àlìàs ìs vìsìblè tò àny ùsèr whò hòlds thè òrgànìzàtìòn kèy, bùt fùll còntàct dètàìls sùch às phònè nùmbèr ànd èmàìl àddrèss àrè sèpàràtèly gàtèd by thè Vìèw clìènt PÌÌ pèrmìssìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Vìèwìng thè clìènt lìst rèqùìrès thè Vìèw clìènts pèrmìssìòn, èdìtìng còntàct ìnfòrmàtìòn ànd àlìàsès èàch rèqùìrè thèìr òwn pèrmìssìòn, ànd mèrgìng rèqùìrès thè Mèrgè clìènts pèrmìssìòn. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The client list carries every client record the organization holds, twenty-five at a time, with the number of cases attached to each one. [[#client-data #per..." |
*
* @param {Demo_Narrative_Admin_Clients_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_clients_body = /** @type {((inputs?: Demo_Narrative_Admin_Clients_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Clients_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_clients_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_clients_body(inputs)
	return en_demo_narrative_admin_clients_body(inputs)
});