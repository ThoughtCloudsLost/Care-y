/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Funds_BodyInputs */

const en_demo_narrative_admin_funds_body = /** @type {(inputs: Demo_Narrative_Admin_Funds_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund administration lives on the Organization page as a section gated on the Manage funds permission, in the same shape as Note types and Intake forms. The section lists active and deactivated funds, and each row opens an editor for the fund's name and ISO 4217 currency. [[#permissions #client-data]]
**Creating a fund.** A new fund starts with a sealed zero balance. The browser encrypts the fund's name and currency under the organization key before sending the request, and the server stores the ciphertext without reading it. [[#encryption #server-holds]]
**Deactivation.** Deactivating a fund hides it from the queue fund picker and from the disbursement sheet's fund list. Ledger entries already recorded against the fund survive, and the fund's balance card remains on the audit page. Deactivation is a flag, not a deletion, and can be reversed. [[#failure-states #metadata]]
**Recording an adjustment.** An administrator can record a manual adjustment from the fund administration section, adding or removing money outside the disbursement flow. An adjustment writes one ledger entry and the next sealed balance, with no case note. Adjustments are the mechanism for initial deposits, corrections that do not belong to a case, and reconciliation entries. [[#client-data]]
**Notification toggle.** A toggle controls whether holders of the Manage funds permission receive a notification for each ledger entry. The toggle is a plaintext boolean on the organization's configuration row. When on, the notification is a ticketless system event that names no case. [Notification preferences](#settings/notifications) covers how the recipient mutes it. [[#server-holds #metadata]]
**Currency format.** Amounts display in the fund's currency through \`Intl.NumberFormat\` with the active UI locale. The fund carries an ISO 4217 code, validated on create and on edit. [[#client-data]]
**The service and its callers.** \`FundsSection.svelte\` in \`packages/client/src/lib/components/admin/\` follows the \`NoteTypesSection\` anatomy: a card of tappable rows, a create and edit sheet with a deactivate action at the foot. The adjustment mutation calls \`funds.recordAdjustment\`, which requires the Manage funds permission. \`org-config-service.ts\` on the server stores the notification toggle as \`notify_fund_managers\` on the organization's configuration row. [[#client-data #permissions]]`)
};

const es_demo_narrative_admin_funds_body = /** @type {(inputs: Demo_Narrative_Admin_Funds_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La administración de fondos vive en la página de Organización como una sección restringida al permiso Gestionar fondos, con la misma forma que Tipos de nota y Formularios de ingreso. La sección lista los fondos activos y desactivados, y cada fila abre un editor para el nombre del fondo y su moneda ISO 4217. [[#permissions #client-data]]
**Creación de un fondo.** Un fondo nuevo comienza con un saldo sellado en cero. El navegador cifra el nombre y la moneda del fondo bajo la clave de la organización antes de enviar la solicitud, y el servidor almacena el texto cifrado sin leerlo. [[#encryption #server-holds]]
**Desactivación.** Desactivar un fondo lo oculta del selector de fondo en colas y de la lista de fondos en la hoja de desembolso. Las entradas del libro mayor ya registradas contra el fondo sobreviven, y la tarjeta de saldo del fondo permanece en la página de auditoría. La desactivación es una marca, no una eliminación, y se puede revertir. [[#failure-states #metadata]]
**Registro de un ajuste.** Una persona administradora puede registrar un ajuste manual desde la sección de administración de fondos, sumando o restando dinero fuera del flujo de desembolsos. Un ajuste escribe una entrada en el libro mayor y el siguiente saldo sellado, sin nota de caso. Los ajustes son el mecanismo para depósitos iniciales, correcciones que no pertenecen a un caso y asientos de conciliación. [[#client-data]]
**Interruptor de notificaciones.** Un interruptor controla si las personas con el permiso Gestionar fondos reciben una notificación por cada entrada del libro mayor. El interruptor es un booleano en texto plano en la fila de configuración de la organización. Cuando está activado, la notificación es un evento de sistema sin ticket que no nombra caso alguno. [Preferencias de notificación](#settings/notifications) trata cómo el destinatario la silencia. [[#server-holds #metadata]]
**Formato de moneda.** Los montos se muestran en la moneda del fondo a través de \`Intl.NumberFormat\` con el idioma activo de la interfaz. El fondo lleva un código ISO 4217, validado al crear y al editar. [[#client-data]]
**El servicio y sus consumidores.** \`FundsSection.svelte\` en \`packages/client/src/lib/components/admin/\` sigue la anatomía de \`NoteTypesSection\`: una tarjeta de filas interactivas, una hoja de creación y edición con una acción de desactivación al pie. La mutación de ajuste llama a \`funds.recordAdjustment\`, que requiere el permiso Gestionar fondos. \`org-config-service.ts\` en el servidor almacena el interruptor de notificaciones como \`notify_fund_managers\` en la fila de configuración de la organización. [[#client-data #permissions]]`)
};

const en_xa2_demo_narrative_admin_funds_body = /** @type {(inputs: Demo_Narrative_Admin_Funds_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd àdmìnìstràtìòn lìvès òn thè Òrgànìzàtìòn pàgè às à sèctìòn gàtèd òn thè Mànàgè fùnds pèrmìssìòn, ìn thè sàmè shàpè às Nòtè typès ànd Ìntàkè fòrms. Thè sèctìòn lìsts àctìvè ànd dèàctìvàtèd fùnds, ànd èàch ròw òpèns àn èdìtòr fòr thè fùnd's nàmè ànd ÌSÒ 4217 cùrrèncy. [[#pèrmìssìòns #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Crèàtìng à fùnd. •••••** À nèw fùnd stàrts wìth à sèàlèd zèrò bàlàncè. Thè bròwsèr èncrypts thè fùnd's nàmè ànd cùrrèncy ùndèr thè òrgànìzàtìòn kèy bèfòrè sèndìng thè rèqùèst, ànd thè sèrvèr stòrès thè cìphèrtèxt wìthòùt rèàdìng ìt. [[#èncryptìòn #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèàctìvàtìòn. ••••** Dèàctìvàtìng à fùnd hìdès ìt fròm thè qùèùè fùnd pìckèr ànd fròm thè dìsbùrsèmènt shèèt's fùnd lìst. Lèdgèr èntrìès àlrèàdy rècòrdèd àgàìnst thè fùnd sùrvìvè, ànd thè fùnd's bàlàncè càrd rèmàìns òn thè àùdìt pàgè. Dèàctìvàtìòn ìs à flàg, nòt à dèlètìòn, ànd càn bè rèvèrsèd. [[#fàìlùrè-stàtès #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rècòrdìng àn àdjùstmènt. ••••••••** Àn àdmìnìstràtòr càn rècòrd à mànùàl àdjùstmènt fròm thè fùnd àdmìnìstràtìòn sèctìòn, àddìng òr rèmòvìng mònèy òùtsìdè thè dìsbùrsèmènt flòw. Àn àdjùstmènt wrìtès ònè lèdgèr èntry ànd thè nèxt sèàlèd bàlàncè, wìth nò càsè nòtè. Àdjùstmènts àrè thè mèchànìsm fòr ìnìtìàl dèpòsìts, còrrèctìòns thàt dò nòt bèlòng tò à càsè, ànd rècòncìlìàtìòn èntrìès. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Nòtìfìcàtìòn tògglè. ••••••** À tògglè còntròls whèthèr hòldèrs òf thè Mànàgè fùnds pèrmìssìòn rècèìvè à nòtìfìcàtìòn fòr èàch lèdgèr èntry. Thè tògglè ìs à plàìntèxt bòòlèàn òn thè òrgànìzàtìòn's cònfìgùràtìòn ròw. Whèn òn, thè nòtìfìcàtìòn ìs à tìckètlèss systèm èvènt thàt nàmès nò càsè. [Nòtìfìcàtìòn prèfèrèncès](#sèttìngs/nòtìfìcàtìòns) còvèrs hòw thè rècìpìènt mùtès ìt. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Cùrrèncy fòrmàt. •••••** Àmòùnts dìsplày ìn thè fùnd's cùrrèncy thròùgh \`Ìntl.NùmbèrFòrmàt\` wìth thè àctìvè ÙÌ lòcàlè. Thè fùnd càrrìès àn ÌSÒ 4217 còdè, vàlìdàtèd òn crèàtè ànd òn èdìt. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè sèrvìcè ànd ìts càllèrs. •••••••••** \`FùndsSèctìòn.svèltè\` ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/àdmìn/\` fòllòws thè \`NòtèTypèsSèctìòn\` ànàtòmy: à càrd òf tàppàblè ròws, à crèàtè ànd èdìt shèèt wìth à dèàctìvàtè àctìòn àt thè fòòt. Thè àdjùstmènt mùtàtìòn càlls \`fùnds.rècòrdÀdjùstmènt\`, whìch rèqùìrès thè Mànàgè fùnds pèrmìssìòn. \`òrg-cònfìg-sèrvìcè.ts\` òn thè sèrvèr stòrès thè nòtìfìcàtìòn tògglè às \`nòtìfy_fùnd_mànàgèrs\` òn thè òrgànìzàtìòn's cònfìgùràtìòn ròw. [[#clìènt-dàtà #pèrmìssìòns]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Fund administration lives on the Organization page as a section gated on the Manage funds permission, in the same shape as Note types and Intake forms. The s..." |
*
* @param {Demo_Narrative_Admin_Funds_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_funds_body = /** @type {((inputs?: Demo_Narrative_Admin_Funds_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Funds_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_funds_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_funds_body(inputs)
	return en_demo_narrative_admin_funds_body(inputs)
});