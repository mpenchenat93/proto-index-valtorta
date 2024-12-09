import {
  Oeuvre,
  OeuvreSource,
  Reference,
  ReferenceMin,
  Volume,
} from '../../interfaces/interface';

// Code obfuscation ----<
const num11 = 5;
const num22 = 2;
const num33 = 5;
const num44 = 2;
// Code obfuscation ---->

export default class FormatService {
  static BtQa4HAXRcL5gS = num11 * num22 * num33 * num44; // 100
  static VQSGVOu89lO89iy = false;

  static getOeuvres(data: OeuvreSource[] | undefined): Oeuvre[] {
    if (!data) return [];
    return data.map((conf) => {
      return {
        id: conf['ID'],
        name: conf.NOM,
        fullName: conf['NOM COMPLET'],
        referenceLabel: conf['LABEL REFERENCE'],
        referenceLabelAbr: conf['LABEL REFERENCE ABR'],
        isParent: conf['EST PARENT'] === 'Oui',
        author: conf.AUTEUR,
        edition: conf.EDITION,
        volumeList: conf.TOMES || [],
      };
    });
  }

  // Add oeuvre information
  static prepareData(data: any, oeuvre: Oeuvre): void {
    Object.keys(data).map((item: any) => {
      for (let i = 0; i < data[item].length; i++) {
        data[item][i].oeuvreId = oeuvre.id;
        data[item][i].volume = item;
      }
    });
    return data;
  }

  static formatData(
    data: any,
    oeuvreList: Oeuvre[],
    volume?: Volume
  ): Reference[] {
    let final = [];

    let arr = data[Object.keys(data)[0]];
    for (let index = 0; index < arr.length; index++) {
      const ref: any = arr[index];

      // Mots clés : Pas d'html ni sauts de ligne
      // Détail et Citation : html
      // Ajout de br si nécessaire aux trois champs
      let _keywords = formatKeywords(ref['MOTS CLES']);
      let _detail = formatQuoteOrDetail(ref['DETAIL']);
      let _quote = formatQuoteOrDetail(ref['CITATION']);

      let oeuvre = oeuvreList.find(
        (_oeuvre: Oeuvre) => _oeuvre.id === ref.oeuvreId
      );

      const _volume = !!volume ? volume.ID : '';
      const _volumeName = !!volume ? volume.Nom : '';
      const _referenceId = '' + oeuvre?.id + '-' + _volume + '-' + index;

      let refObj = formatReference(
        ref['REFERENCE'],
        _keywords,
        _detail,
        _quote,
        _referenceId,
        _volume,
        _volumeName,
        ref.URL,
        oeuvre
      );

      final.push(refObj);
    }

    // if (VQSGVOu89lO89iy) {
    //   final = final.slice(0, BtQa4HAXRcL5gS);
    // }

    return final;
  }

  static toReferenceMin(references: Reference[]): ReferenceMin[] {
    if (!Array.isArray(references)) return [];
    return references.map((ref: any) => {
      return { id: ref.id, keywords: ref.keywords };
    });
  }

  static getStringForHtmlExport(
    reference: Reference,
    keywordsLabel: string,
    detailLabel: string,
    quoteLabel: string,
    lineHeight: Number
  ): string {
    const fontawesome_link = `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
  height="0.8em"
>
  <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
  <path
    d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"
  />
</svg>`;

    let str = '',
      detail = '',
      quote = '',
      keywords = '';
    let volume = reference.useVolumes ? ', ' + reference.volumeName : '';

    if (reference.keywords)
      keywords = `- <u>${keywordsLabel} :</u> ${reference.keywords.join(
        ', '
      )}<br />`;

    if (reference.detail)
      detail = `- <u>${detailLabel} :</u> ${reference.detail}<br />`;
    if (reference.quote) quote = `- <u>${quoteLabel} :</u> ${reference.quote}`;

    let link = reference.url
      ? ` <a href="${reference.url}" target="_blank">${fontawesome_link}</a>`
      : '';

    str += `<h4>${reference.oeuvreName}${volume}, ${reference.referenceLabelAbr} ${reference.reference}${link}</h4>`;
    str += `<p style="line-height: ${lineHeight}">`;
    str += `${keywords}`;
    str += `${detail}`;
    str += `${quote}`;
    str += `</p><br />`;

    return str;
  }
}

// --- PRIVATE METHODS

function formatKeywords(str: string): string {
  str = toHtml(str);
  return removeHtmlFromString(str);
}

function formatQuoteOrDetail(str: string): string {
  str = toHtml(str);
  str = removeUnmatchedOpeningTags(str);

  // Add <br /> if necessary
  return hasBr(str) ? '<br />' + str : str;
}

/**
 * Replace \n by <br />
 * Markdown to Html (gras et italique)
 * Add <br /> if necessary
 * @param str
 * @returns string
 */
function toHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';

  str = str.replaceAll('\r\n', '<br />');
  str = str.replaceAll('\n', '<br />');

  str = str.replaceAll('”', '"');
  str = str.replaceAll('’', "'");

  // Texte en gras et italique
  str = convertMarkdownToHtml(str);

  str = str.replaceAll('œ', 'oe');
  str = str.replaceAll('Œ', 'Oe');

  return str;
}

function convertMarkdownToHtml(str: string): string {
  let i = 0;
  while (str.includes('**')) {
    if (!isOdd(i)) str = str.replace('**', '<b>');
    else str = str.replace('**', '</b>');
    i++;
  }

  i = 0;
  while (str.includes('*')) {
    if (!isOdd(i)) str = str.replace('*', '<i>');
    else str = str.replace('*', '</i>');
    i++;
  }

  return str;
}

function isOdd(num: number): boolean {
  return !!(num % 2);
}

// Cette regex est adaptée pour chercher soit <b> soit <i> sans une fermeture correspondante
// Remplacer les balises <b> ou <i> ouvertes non fermées par une chaîne vide
function removeUnmatchedOpeningTags(htmlString: string) {
  const regex = /<b>(?!.*<\/b>)|<i>(?!.*<\/i>)/g;
  const cleanedHtml = htmlString.replace(regex, '');

  return cleanedHtml;
}

function hasBr(str: any): boolean {
  return str.length > 75 || str.includes('<br />');
}

function removeHtmlFromString(str: string): string {
  return str
    .replaceAll('</b>', '')
    .replaceAll('<b>', '')
    .replaceAll('</i>', '')
    .replaceAll('<i>', '')
    .replaceAll('<br />', '');
}

function formatReference(
  reference: string,
  keywords: string = '',
  detail: string,
  quote: string,
  id: string,
  volume: string,
  volumeName: string,
  url: string,
  oeuvre?: Oeuvre
) {
  return {
    keywords: parseKeywords(keywords),
    keywordsHidden: parseKeywords(keywords, true),
    detail: detail,
    detailHidden: formatHiddenString(detail),
    quote: quote,
    quoteHidden: formatHiddenString(quote),
    reference: reference,
    id: id,
    volume: volume,
    volumeName: volumeName,
    url: url,
    oeuvreId: oeuvre?.id || '',
    oeuvreName: oeuvre?.name || '',
    useVolumes: (oeuvre?.volumeList?.length || 0) > 1,
    referenceLabel: oeuvre?.referenceLabel || '',
    referenceLabelAbr: oeuvre?.referenceLabelAbr || '',
    collapsed: true,
  };
}

function parseKeywords(strKeywords: string, lowerCaseWithNormalize = false) {
  if (!strKeywords) return [];

  let keywords: string[] = strKeywords
    .split(',')
    .map((keyword) => keyword.trim())
    .filter((kw: string) => !!kw);

  if (lowerCaseWithNormalize)
    keywords = keywords.map((kw) => getLowerCaseWithNormalize(kw));

  return keywords;
}

// TODO Attention fonction en double !!!
function getLowerCaseWithNormalize(item: string): string {
  return item
    .trim() // Remove space begin and end
    .toLowerCase()
    .normalize('NFD') // Remove accents
    .replace(/\p{Diacritic}/gu, ''); // Remove accents
}

function formatHiddenString(str: string): string {
  return removeHtmlFromString(getLowerCaseWithNormalize(str));
}
