/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Retention_BodyInputs */

const en_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A new organization starts with automatic deletion off. The user turns it on by choosing a window between 1 and 3,650 days; 365 is filled in as a starting point. Closed cases, their messages, files, and caller personal information older than the window are hard-deleted permanently. Enabling the policy and changing the window both require confirmation, and the confirmation states that deleted data cannot be recovered, because the escrow file holds key material and not data rows. Disabling the policy also requires confirmation and returns the organization to keeping records until someone deletes them by hand. [[#retention]]
**Why one window?** The window is a single organization-wide setting, not a choice per queue or per case type. A per-queue window would be a decision someone has to get right on the day they create a queue. [[#retention #metadata]]
**What falls outside the window?** Independent schedules delete data on their own terms and are unaffected by this setting.
- Portal message copies on the client side
- One-time share links
- Logs held at the telephony provider
[Data retention](#deep-dive/data-retention) covers each of those lifetimes. Nothing outside the organization's own database is in scope, so a copy a client kept on a personal device, a message in someone else's mailbox, or a record a third party holds all survive the window. Deletion is permanent; no escrow ceremony and no backup restores a row the policy removed. [[#retention #failure-states]]
**What does the setting itself disclose?** The window is stored as a plaintext integer column alongside the encrypted columns in the organization configuration row. A database dump shows the organization's retention choice in the clear. After a sweep, the row counts and foreign key relationships that remain are still readable structurally, so the dump reveals the shape of the deleted work. [The trust boundary](#deep-dive/the-trust-boundary) covers what that shape gives away. [[#server-holds #metadata #retention]]
**Who can change the retention window?** Changing the window requires the Manage retention permission, which belongs to Admin by default and can be moved to another role. [The permission system](#deep-dive/the-permission-system) covers how a permission moves and which three can never move. [[#permissions]]
**The retention column and its write path.** \`RetentionSection.svelte\` renders on the organization admin page and again inside the first-run setup flow with its save button supplied externally. The value is written through \`setPiiRetentionDays\` in \`packages/server/src/auth/service.ts\` behind a permission-gated procedure in \`packages/server/src/routes/auth.ts\`, and read back through \`auth.hubRetention\`. The column is \`org_config.pii_retention_days\` in \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. [[#retention #server-holds]]`)
};

const es_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una organización nueva empieza con la eliminación automática desactivada. La persona usuaria la activa eligiendo una ventana de entre 1 y 3.650 días; 365 aparece como punto de partida. Los casos cerrados, sus mensajes, archivos e información personal de las personas que llamaron con una antigüedad superior a la ventana se eliminan permanentemente. Activar la política y cambiar la ventana requieren confirmación, y la confirmación indica que los datos eliminados no se pueden recuperar, porque el archivo de custodia guarda material de claves y no filas de datos. Desactivar la política también requiere confirmación y devuelve a la organización a conservar registros hasta que alguien los elimine a mano. [[#retention]]
**¿Por qué una sola ventana?** La ventana es un único ajuste para toda la organización, no una elección por cola o por tipo de caso. Una ventana por cola sería una decisión que alguien tendría que acertar el día que crea una cola. [[#retention #metadata]]
**¿Qué queda fuera de la ventana?** Programaciones independientes eliminan datos según sus propios plazos y no se ven afectadas por este ajuste.
- Las copias de mensajes del portal en el lado del cliente
- Los enlaces compartidos de un solo uso
- Los registros que guarda el proveedor de telefonía
[Retención de datos](#deep-dive/data-retention) trata cada uno de esos ciclos de vida. Nada que esté fuera de la base de datos de la propia organización entra en el alcance, así que una copia que el cliente guardó en un dispositivo personal, un mensaje en el buzón de otra persona o un registro en manos de un tercero sobreviven a la ventana. La eliminación es permanente; ninguna ceremonia de custodia ni copia de seguridad restaura una fila que la política haya quitado. [[#retention #failure-states]]
**¿Qué revela el propio ajuste?** La ventana se guarda como una columna de entero en texto plano junto a las columnas cifradas de la fila de configuración de la organización. Un volcado de la base de datos muestra en claro la elección de retención de la organización. Tras un barrido, los recuentos de filas y las relaciones de clave foránea que quedan siguen siendo legibles a nivel estructural, de modo que el volcado revela la forma del trabajo eliminado. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que esa forma deja ver. [[#server-holds #metadata #retention]]
**¿Quién puede cambiar la ventana de retención?** Cambiar la ventana requiere el permiso Gestionar retención, que pertenece a Admin por defecto y puede trasladarse a otro rol. [El sistema de permisos](#deep-dive/the-permission-system) trata cómo se traslada un permiso y cuáles son los tres que nunca pueden trasladarse. [[#permissions]]
**La columna de retención y su ruta de escritura.** \`RetentionSection.svelte\` se renderiza en la página de administración de la organización y de nuevo dentro del flujo de configuración inicial con el botón de guardado suministrado externamente. El valor se escribe mediante \`setPiiRetentionDays\` en \`packages/server/src/auth/service.ts\` detrás de un procedimiento protegido por permiso en \`packages/server/src/routes/auth.ts\`, y se lee de nuevo a través de \`auth.hubRetention\`. La columna es \`org_config.pii_retention_days\`, en \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. [[#retention #server-holds]]`)
};

const en_xa2_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À nèw òrgànìzàtìòn stàrts wìth àùtòmàtìc dèlètìòn òff. Thè ùsèr tùrns ìt òn by chòòsìng à wìndòw bètwèèn 1 ànd 3,650 dàys; 365 ìs fìllèd ìn às à stàrtìng pòìnt. Clòsèd càsès, thèìr mèssàgès, fìlès, ànd càllèr pèrsònàl ìnfòrmàtìòn òldèr thàn thè wìndòw àrè hàrd-dèlètèd pèrmànèntly. Ènàblìng thè pòlìcy ànd chàngìng thè wìndòw bòth rèqùìrè cònfìrmàtìòn, ànd thè cònfìrmàtìòn stàtès thàt dèlètèd dàtà cànnòt bè rècòvèrèd, bècàùsè thè èscròw fìlè hòlds kèy màtèrìàl ànd nòt dàtà ròws. Dìsàblìng thè pòlìcy àlsò rèqùìrès cònfìrmàtìòn ànd rètùrns thè òrgànìzàtìòn tò kèèpìng rècòrds ùntìl sòmèònè dèlètès thèm by hànd. [[#rètèntìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why ònè wìndòw? •••••** Thè wìndòw ìs à sìnglè òrgànìzàtìòn-wìdè sèttìng, nòt à chòìcè pèr qùèùè òr pèr càsè typè. À pèr-qùèùè wìndòw wòùld bè à dècìsìòn sòmèònè hàs tò gèt rìght òn thè dày thèy crèàtè à qùèùè. [[#rètèntìòn #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt fàlls òùtsìdè thè wìndòw? •••••••••** Ìndèpèndènt schèdùlès dèlètè dàtà òn thèìr òwn tèrms ànd àrè ùnàffèctèd by thìs sèttìng.
- Pòrtàl mèssàgè còpìès òn thè clìènt sìdè
- Ònè-tìmè shàrè lìnks
- Lògs hèld àt thè tèlèphòny pròvìdèr
[Dàtà rètèntìòn](#dèèp-dìvè/dàtà-rètèntìòn) còvèrs èàch òf thòsè lìfètìmès. Nòthìng òùtsìdè thè òrgànìzàtìòn's òwn dàtàbàsè ìs ìn scòpè, sò à còpy à clìènt kèpt òn à pèrsònàl dèvìcè, à mèssàgè ìn sòmèònè èlsè's màìlbòx, òr à rècòrd à thìrd pàrty hòlds àll sùrvìvè thè wìndòw. Dèlètìòn ìs pèrmànènt; nò èscròw cèrèmòny ànd nò bàckùp rèstòrès à ròw thè pòlìcy rèmòvèd. [[#rètèntìòn #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèttìng ìtsèlf dìsclòsè? ••••••••••••** Thè wìndòw ìs stòrèd às à plàìntèxt ìntègèr còlùmn àlòngsìdè thè èncryptèd còlùmns ìn thè òrgànìzàtìòn cònfìgùràtìòn ròw. À dàtàbàsè dùmp shòws thè òrgànìzàtìòn's rètèntìòn chòìcè ìn thè clèàr. Àftèr à swèèp, thè ròw còùnts ànd fòrèìgn kèy rèlàtìònshìps thàt rèmàìn àrè stìll rèàdàblè strùctùràlly, sò thè dùmp rèvèàls thè shàpè òf thè dèlètèd wòrk. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whàt thàt shàpè gìvès àwày. [[#sèrvèr-hòlds #mètàdàtà #rètèntìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whò càn chàngè thè rètèntìòn wìndòw? •••••••••••** Chàngìng thè wìndòw rèqùìrès thè Mànàgè rètèntìòn pèrmìssìòn, whìch bèlòngs tò Àdmìn by dèfàùlt ànd càn bè mòvèd tò ànòthèr ròlè. [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs hòw à pèrmìssìòn mòvès ànd whìch thrèè càn nèvèr mòvè. [[#pèrmìssìòns]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè rètèntìòn còlùmn ànd ìts wrìtè pàth. ••••••••••••** \`RètèntìònSèctìòn.svèltè\` rèndèrs òn thè òrgànìzàtìòn àdmìn pàgè ànd àgàìn ìnsìdè thè fìrst-rùn sètùp flòw wìth ìts sàvè bùttòn sùpplìèd èxtèrnàlly. Thè vàlùè ìs wrìttèn thròùgh \`sètPììRètèntìònDàys\` ìn \`pàckàgès/sèrvèr/src/àùth/sèrvìcè.ts\` bèhìnd à pèrmìssìòn-gàtèd pròcèdùrè ìn \`pàckàgès/sèrvèr/src/ròùtès/àùth.ts\`, ànd rèàd bàck thròùgh \`àùth.hùbRètèntìòn\`. Thè còlùmn ìs \`òrg_cònfìg.pìì_rètèntìòn_dàys\` ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\`. [[#rètèntìòn #sèrvèr-hòlds]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A new organization starts with automatic deletion off. The user turns it on by choosing a window between 1 and 3,650 days; 365 is filled in as a starting poi..." |
*
* @param {Demo_Narrative_Admin_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_retention_body = /** @type {((inputs?: Demo_Narrative_Admin_Retention_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Retention_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_retention_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_retention_body(inputs)
	return en_demo_narrative_admin_retention_body(inputs)
});