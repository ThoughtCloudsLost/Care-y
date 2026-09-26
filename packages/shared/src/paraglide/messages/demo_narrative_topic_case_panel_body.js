/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Panel_BodyInputs */

const en_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The panel holds the client's contact details and their channel, the notes and files on the ticket, and the actions available on it:
- Editing
- Assigning
- Changing priority or queue
- Placing a hold
- Watching
- Taking or releasing
- Closing or reopening [[#client-data #ticket-detail]]
**Contact visibility.** The server returns contact details in one of three forms, decided per request. A user with the View clients permission sees a masked phone number with only the last four digits. A user with the View client PII permission sees the full formatted number. A user with neither permission, on a ticket they do not hold, sees a notice that the details were withheld. The three states are distinguished deliberately rather than inferred from a missing value; only the server can tell whether a contact is absent, available to add, or withheld from this caller. [The permission system](#deep-dive/the-permission-system) covers where those permissions come from. [[#permissions #privacy]]
**Why can the server read a number at all?** Contact values are encrypted under the server's operational key, not the ticket key. The server needs to read the number to place a call or send a text. The server decrypts, formats, and zeroes the buffer immediately. An email audit entry records only which client and which account acted. A seized database yields client phone numbers and email addresses if the operational key is also seized. The ticket content stays encrypted regardless. [The trust boundary](#deep-dive/the-trust-boundary) covers that split, and [the telephony relay](#deep-dive/the-telephony-relay) covers why the relay needs the value. [[#trust-boundary #server-holds]]
**What happens when a number already belongs to someone?** Saving a phone number or email address that already belongs to another client opens the merge flow rather than creating a second record for the same contact. [Merging clients](#admin-people/client-merge) covers what a merge does to the two records. [[#client-data]]
**The panel query and its children.** \`TicketPanelContent.svelte\` reads the same query key the [case header](#ticket-detail/case-header) and the thread use, so it reads the cached ticket rather than costing another request. It also queries \`ticketKeys.isWatching(ticketId)\`, which is its own request. The withheld state rides as its own boolean, \`contactWithheld\`, because a null value is ambiguous and the server is the only actor that can disambiguate. The component takes the notes section, the files section, and the [portal tier](#ticket-detail/portal-tier) section as children. [Internal notes](#ticket-detail/notes) covers the notes it lists. [[#ticket-detail]]`)
};

const es_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel contiene los datos de contacto del cliente y su canal, las notas y los archivos del ticket, y las acciones disponibles:
- Editar
- Asignar
- Cambiar prioridad o cola
- Poner en espera
- Seguir
- Tomar o soltar
- Cerrar o reabrir [[#client-data #ticket-detail]]
**Visibilidad del contacto.** El servidor devuelve los datos de contacto en una de tres formas, decidida por solicitud. Con el permiso Ver clientes se ve un número de teléfono enmascarado con solo los últimos cuatro dígitos. Con el permiso Ver datos personales del cliente se ve el número completo con formato. Sin ninguno de los dos permisos, en un ticket no asignado, se ve un aviso de que los datos fueron retenidos. Los tres estados se distinguen de forma deliberada en lugar de inferirse de un valor ausente; solo el servidor puede determinar si un contacto no existe, si se puede agregar uno, o si los datos fueron retenidos para esta cuenta. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde provienen esos permisos. [[#permissions #privacy]]
**¿Por qué puede el servidor leer un número?** Los valores de contacto se cifran con la clave operativa del servidor, no con la clave del ticket. El servidor necesita leer el número para realizar una llamada o enviar un mensaje de texto. El servidor descifra, formatea y pone a cero el buffer de inmediato. Una entrada de auditoría de correo registra solo qué cliente y qué cuenta actuaron. Una base de datos incautada revela números de teléfono y direcciones de correo si la clave operativa también se incauta. El contenido del ticket permanece cifrado en cualquier caso. [La frontera de confianza](#deep-dive/the-trust-boundary) trata esa división, y [el relay de telefonía](#deep-dive/the-telephony-relay) trata por qué el relay necesita el valor. [[#trust-boundary #server-holds]]
**¿Qué ocurre cuando un número ya pertenece a alguien?** Guardar un número de teléfono o una dirección de correo que ya pertenece a otro cliente abre el flujo de fusión en lugar de crear un segundo registro para el mismo contacto. [Fusionar clientes](#admin-people/client-merge) trata lo que una fusión hace con los dos registros. [[#client-data]]
**La consulta del panel y sus hijos.** \`TicketPanelContent.svelte\` lee la misma clave de consulta que [el encabezado del caso](#ticket-detail/case-header) y el hilo, de modo que lee el ticket en caché en lugar de generar otra solicitud. También consulta \`ticketKeys.isWatching(ticketId)\`, que es una solicitud propia. El estado de retención viaja como un booleano propio, \`contactWithheld\`, porque un valor nulo es ambiguo y el servidor es el único actor que puede desambiguarlo. El componente recibe la sección de notas, la sección de archivos y la sección de [nivel de acceso al portal](#ticket-detail/portal-tier) como hijos. [Notas internas](#ticket-detail/notes) trata las notas que enumera. [[#ticket-detail]]`)
};

const en_xa2_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pànèl hòlds thè clìènt's còntàct dètàìls ànd thèìr chànnèl, thè nòtès ànd fìlès òn thè tìckèt, ànd thè àctìòns àvàìlàblè òn ìt:
- Èdìtìng
- Àssìgnìng
- Chàngìng prìòrìty òr qùèùè
- Plàcìng à hòld
- Wàtchìng
- Tàkìng òr rèlèàsìng
- Clòsìng òr rèòpènìng [[#clìènt-dàtà #tìckèt-dètàìl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còntàct vìsìbìlìty. ••••••** Thè sèrvèr rètùrns còntàct dètàìls ìn ònè òf thrèè fòrms, dècìdèd pèr rèqùèst. À ùsèr wìth thè Vìèw clìènts pèrmìssìòn sèès à màskèd phònè nùmbèr wìth ònly thè làst fòùr dìgìts. À ùsèr wìth thè Vìèw clìènt PÌÌ pèrmìssìòn sèès thè fùll fòrmàttèd nùmbèr. À ùsèr wìth nèìthèr pèrmìssìòn, òn à tìckèt thèy dò nòt hòld, sèès à nòtìcè thàt thè dètàìls wèrè wìthhèld. Thè thrèè stàtès àrè dìstìngùìshèd dèlìbèràtèly ràthèr thàn ìnfèrrèd fròm à mìssìng vàlùè; ònly thè sèrvèr càn tèll whèthèr à còntàct ìs àbsènt, àvàìlàblè tò àdd, òr wìthhèld fròm thìs càllèr. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs whèrè thòsè pèrmìssìòns còmè fròm. [[#pèrmìssìòns #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why càn thè sèrvèr rèàd à nùmbèr àt àll? ••••••••••••** Còntàct vàlùès àrè èncryptèd ùndèr thè sèrvèr's òpèràtìònàl kèy, nòt thè tìckèt kèy. Thè sèrvèr nèèds tò rèàd thè nùmbèr tò plàcè à càll òr sènd à tèxt. Thè sèrvèr dècrypts, fòrmàts, ànd zèròès thè bùffèr ìmmèdìàtèly. Àn èmàìl àùdìt èntry rècòrds ònly whìch clìènt ànd whìch àccòùnt àctèd. À sèìzèd dàtàbàsè yìèlds clìènt phònè nùmbèrs ànd èmàìl àddrèssès ìf thè òpèràtìònàl kèy ìs àlsò sèìzèd. Thè tìckèt còntènt stàys èncryptèd règàrdlèss. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs thàt splìt, ànd [thè tèlèphòny rèlày](#dèèp-dìvè/thè-tèlèphòny-rèlày) còvèrs why thè rèlày nèèds thè vàlùè. [[#trùst-bòùndàry #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns whèn à nùmbèr àlrèàdy bèlòngs tò sòmèònè? •••••••••••••••••** Sàvìng à phònè nùmbèr òr èmàìl àddrèss thàt àlrèàdy bèlòngs tò ànòthèr clìènt òpèns thè mèrgè flòw ràthèr thàn crèàtìng à sècònd rècòrd fòr thè sàmè còntàct. [Mèrgìng clìènts](#àdmìn-pèòplè/clìènt-mèrgè) còvèrs whàt à mèrgè dòès tò thè twò rècòrds. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè pànèl qùèry ànd ìts chìldrèn. ••••••••••** \`TìckètPànèlCòntènt.svèltè\` rèàds thè sàmè qùèry kèy thè [càsè hèàdèr](#tìckèt-dètàìl/càsè-hèàdèr) ànd thè thrèàd ùsè, sò ìt rèàds thè càchèd tìckèt ràthèr thàn còstìng ànòthèr rèqùèst. Ìt àlsò qùèrìès \`tìckètKèys.ìsWàtchìng(tìckètÌd)\`, whìch ìs ìts òwn rèqùèst. Thè wìthhèld stàtè rìdès às ìts òwn bòòlèàn, \`còntàctWìthhèld\`, bècàùsè à nùll vàlùè ìs àmbìgùòùs ànd thè sèrvèr ìs thè ònly àctòr thàt càn dìsàmbìgùàtè. Thè còmpònènt tàkès thè nòtès sèctìòn, thè fìlès sèctìòn, ànd thè [pòrtàl tìèr](#tìckèt-dètàìl/pòrtàl-tìèr) sèctìòn às chìldrèn. [Ìntèrnàl nòtès](#tìckèt-dètàìl/nòtès) còvèrs thè nòtès ìt lìsts. [[#tìckèt-dètàìl]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The panel holds the client's contact details and their channel, the notes and files on the ticket, and the actions available on it: - Editing - Assigning - C..." |
*
* @param {Demo_Narrative_Topic_Case_Panel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_panel_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Panel_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Panel_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_case_panel_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_case_panel_body(inputs)
	return en_demo_narrative_topic_case_panel_body(inputs)
});