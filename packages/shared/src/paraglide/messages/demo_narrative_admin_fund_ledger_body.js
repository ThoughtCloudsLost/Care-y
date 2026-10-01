/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Fund_Ledger_BodyInputs */

const en_demo_narrative_admin_fund_ledger_body = /** @type {(inputs: Demo_Narrative_Admin_Fund_Ledger_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The fund ledger page shows one balance card per active fund with the full ledger below it, reached from a tile on the admin hub. Viewing requires the Audit funds permission, which sits with Admin by default, and the page redirects home without it. [[#permissions]]
**Balance cards.** Each card shows the fund's sealed running balance, the same figure the queue cards and the case panel display. Below it, the card breaks the ledger down into adjusted, disbursed, and available. The breakdown sums the decrypted ledger entries in the browser. [[#encryption #client-data]]
**Ledger entries.** Each entry carries an amount, a type (disbursement, adjustment, or reversal), a date at day granularity, and the account that recorded it. All of these fields are inside the encrypted payload. The server stores one ciphertext column and a calendar date per row, and the entry list is ordered newest day first. [[#server-holds #encryption #metadata]]
**Recomputing the sealed balance.** When the card's sealed balance disagrees with the ledger sum, a user with the Manage funds permission can reseal the balance from the ledger. The browser sums the decrypted entries, seals the result under the organization key, and writes it back with a version check. The ledger is the authoritative record, and the sealed balance is a cache of its sum. [[#encryption #keys]]
**Reversal attribution.** A reversal entry names the entry it cancels. The ledger groups a reversal under the same bucket as the original: a reversed disbursement counts toward disbursed, and a reversed adjustment counts toward adjusted, following chains of reversals up to a fixed depth. [[#metadata]]
**The ledger query and the balance math.** \`funds.listLedger\` returns all rows, decrypted in the browser by the same organization key cache the fund store uses. \`computeLedgerTotals\` and \`computeLedgerTotalsByFund\` in \`packages/client/src/lib/funds/balances.ts\` run the summation. \`FundBalanceCard.svelte\` and \`FundHistoryList.svelte\` in \`packages/client/src/lib/components/funds/\` render the cards and the entry list. [[#client-data]]`)
};

const es_demo_narrative_admin_fund_ledger_body = /** @type {(inputs: Demo_Narrative_Admin_Fund_Ledger_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página del libro mayor de fondos muestra una tarjeta de saldo por cada fondo activo con el libro mayor completo debajo, accesible desde un mosaico en el panel de administración. Ver la página requiere el permiso Auditar fondos, que corresponde a Admin de forma predeterminada, y la página redirige al inicio sin él. [[#permissions]]
**Tarjetas de saldo.** Cada tarjeta muestra el saldo sellado del fondo, la misma cifra que muestran las tarjetas de cola y el panel del caso. Debajo, la tarjeta desglosa el libro mayor en ajustado, desembolsado y disponible. El desglose suma las entradas descifradas del libro mayor en el navegador. [[#encryption #client-data]]
**Entradas del libro mayor.** Cada entrada lleva un monto, un tipo (desembolso, ajuste o reversión), una fecha con granularidad diaria y la cuenta que la registró. Todos estos campos están dentro de la carga cifrada. El servidor almacena una columna de texto cifrado y una fecha de calendario por fila, y la lista de entradas se ordena por día más reciente primero. [[#server-holds #encryption #metadata]]
**Recalcular el saldo sellado.** Cuando el saldo sellado de la tarjeta no coincide con la suma del libro mayor, una persona con el permiso Gestionar fondos puede resellar el saldo a partir del libro mayor. El navegador suma las entradas descifradas, sella el resultado bajo la clave de la organización y lo escribe de vuelta con una verificación de versión. El libro mayor es el registro autoritativo, y el saldo sellado es una caché de su suma. [[#encryption #keys]]
**Atribución de reversiones.** Una entrada de reversión nombra la entrada que cancela. El libro mayor agrupa una reversión en la misma categoría que la original: un desembolso revertido cuenta como desembolsado y un ajuste revertido cuenta como ajustado, siguiendo cadenas de reversiones hasta una profundidad fija. [[#metadata]]
**La consulta del libro mayor y las matemáticas de saldo.** \`funds.listLedger\` devuelve todas las filas, descifradas en el navegador con la misma caché de clave de organización que usa el almacén de fondos. \`computeLedgerTotals\` y \`computeLedgerTotalsByFund\` en \`packages/client/src/lib/funds/balances.ts\` ejecutan la suma. \`FundBalanceCard.svelte\` y \`FundHistoryList.svelte\` en \`packages/client/src/lib/components/funds/\` renderizan las tarjetas y la lista de entradas. [[#client-data]]`)
};

const en_xa2_demo_narrative_admin_fund_ledger_body = /** @type {(inputs: Demo_Narrative_Admin_Fund_Ledger_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fùnd lèdgèr pàgè shòws ònè bàlàncè càrd pèr àctìvè fùnd wìth thè fùll lèdgèr bèlòw ìt, rèàchèd fròm à tìlè òn thè àdmìn hùb. Vìèwìng rèqùìrès thè Àùdìt fùnds pèrmìssìòn, whìch sìts wìth Àdmìn by dèfàùlt, ànd thè pàgè rèdìrècts hòmè wìthòùt ìt. [[#pèrmìssìòns]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Bàlàncè càrds. •••••** Èàch càrd shòws thè fùnd's sèàlèd rùnnìng bàlàncè, thè sàmè fìgùrè thè qùèùè càrds ànd thè càsè pànèl dìsplày. Bèlòw ìt, thè càrd brèàks thè lèdgèr dòwn ìntò àdjùstèd, dìsbùrsèd, ànd àvàìlàblè. Thè brèàkdòwn sùms thè dècryptèd lèdgèr èntrìès ìn thè bròwsèr. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Lèdgèr èntrìès. •••••** Èàch èntry càrrìès àn àmòùnt, à typè (dìsbùrsèmènt, àdjùstmènt, òr rèvèrsàl), à dàtè àt dày grànùlàrìty, ànd thè àccòùnt thàt rècòrdèd ìt. Àll òf thèsè fìèlds àrè ìnsìdè thè èncryptèd pàylòàd. Thè sèrvèr stòrès ònè cìphèrtèxt còlùmn ànd à càlèndàr dàtè pèr ròw, ànd thè èntry lìst ìs òrdèrèd nèwèst dày fìrst. [[#sèrvèr-hòlds #èncryptìòn #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rècòmpùtìng thè sèàlèd bàlàncè. ••••••••••** Whèn thè càrd's sèàlèd bàlàncè dìsàgrèès wìth thè lèdgèr sùm, à ùsèr wìth thè Mànàgè fùnds pèrmìssìòn càn rèsèàl thè bàlàncè fròm thè lèdgèr. Thè bròwsèr sùms thè dècryptèd èntrìès, sèàls thè rèsùlt ùndèr thè òrgànìzàtìòn kèy, ànd wrìtès ìt bàck wìth à vèrsìòn chèck. Thè lèdgèr ìs thè àùthòrìtàtìvè rècòrd, ànd thè sèàlèd bàlàncè ìs à càchè òf ìts sùm. [[#èncryptìòn #kèys]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèvèrsàl àttrìbùtìòn. •••••••** À rèvèrsàl èntry nàmès thè èntry ìt càncèls. Thè lèdgèr gròùps à rèvèrsàl ùndèr thè sàmè bùckèt às thè òrìgìnàl: à rèvèrsèd dìsbùrsèmènt còùnts tòwàrd dìsbùrsèd, ànd à rèvèrsèd àdjùstmènt còùnts tòwàrd àdjùstèd, fòllòwìng chàìns òf rèvèrsàls ùp tò à fìxèd dèpth. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè lèdgèr qùèry ànd thè bàlàncè màth. ••••••••••••** \`fùnds.lìstLèdgèr\` rètùrns àll ròws, dècryptèd ìn thè bròwsèr by thè sàmè òrgànìzàtìòn kèy càchè thè fùnd stòrè ùsès. \`còmpùtèLèdgèrTòtàls\` ànd \`còmpùtèLèdgèrTòtàlsByFùnd\` ìn \`pàckàgès/clìènt/src/lìb/fùnds/bàlàncès.ts\` rùn thè sùmmàtìòn. \`FùndBàlàncèCàrd.svèltè\` ànd \`FùndHìstòryLìst.svèltè\` ìn \`pàckàgès/clìènt/src/lìb/còmpònènts/fùnds/\` rèndèr thè càrds ànd thè èntry lìst. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The fund ledger page shows one balance card per active fund with the full ledger below it, reached from a tile on the admin hub. Viewing requires the Audit f..." |
*
* @param {Demo_Narrative_Admin_Fund_Ledger_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_fund_ledger_body = /** @type {((inputs?: Demo_Narrative_Admin_Fund_Ledger_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Fund_Ledger_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_fund_ledger_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_fund_ledger_body(inputs)
	return en_demo_narrative_admin_fund_ledger_body(inputs)
});