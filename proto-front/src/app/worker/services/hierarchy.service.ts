import {
  Errors,
  Reference,
  ValidateHierarchy,
} from '../../interfaces/interface';
import KeywordService from './keyword.service';

export class HierarchyService {
  static validateKeywordInput(input: any): ValidateHierarchy {
    // Vérifie si l'input est un tableau
    if (!Array.isArray(input)) {
      return {
        status: false,
        code: 'ARRAY_REQUIRED',
      };
    }

    for (let i = 0; i < input.length; i++) {
      const item = input[i];

      // Vérifie si la propriété name est présente et est une chaîne de caractères
      if (typeof item.name !== 'string') {
        return {
          status: false,
          data: i,
          code: 'NAME_PROPERTY',
        };
      }

      // Vérifie si la propriété themeIds est présente et est un tableau
      if (!Array.isArray(item.themeIds)) {
        return {
          status: false,
          data: i,
          code: 'THEMEIDS_PROPERTY',
        };
      }

      // Vérifie si themeIds contient uniquement des nombres
      if (!item.themeIds.every((id: any) => typeof id === 'number')) {
        return {
          status: false,
          data: i,
          code: 'THEMEIDS_PROPERTY_STR',
        };
      }

      // Vérifie s'il y a des doublons dans themeIds
      const uniqueIds = new Set(item.themeIds);
      if (uniqueIds.size !== item.themeIds.length) {
        return {
          status: false,
          data: i,
          code: 'THEMEIDS_PROPERTY_UNIQUE',
        };
      }
    }

    // Si toutes les vérifications sont passées, tout est valide
    return { status: true, code: '' };
  }

  static validateThemeInput(input: any): ValidateHierarchy {
    if (!Array.isArray(input)) {
      return {
        status: false,
        code: 'ARRAY_REQUIRED',
      };
    }

    const ids = new Set();
    const parentIds = new Set();

    for (let i = 0; i < input.length; i++) {
      const item = input[i];

      // Vérification de la propriété name
      if (typeof item.name !== 'string') {
        return {
          status: false,
          data: i,
          code: 'NAME_PROPERTY',
        };
      }

      // Vérification de la propriété id
      if (typeof item.id !== 'number') {
        return {
          status: false,
          data: i,
          code: 'ID_NUMBER',
        };
      }

      // Vérification de l'unicité de id
      if (ids.has(item.id)) {
        return {
          status: false,
          data: i,
          code: 'ID_UNIQUE',
        };
      }
      ids.add(item.id);

      // Enregistrement des parentId pour vérification ultérieure
      if ('parentId' in item) {
        if (typeof item.parentId !== 'number') {
          return {
            status: false,
            data: i,
            code: 'PARENTID_NUMBER',
          };
        }
        parentIds.add(item.parentId);
      }
    }

    // Vérification que chaque parentId référence un id existant
    for (let parentId of parentIds) {
      if (!ids.has(parentId)) {
        return {
          status: false,
          data: parentId,
          code: 'PARENTID_EXIST',
        };
      }
    }

    return { status: true, code: '' };
  }

  static findInvalidKeywordsDetails(keywords: any[], themes: any[]) {
    // Construction d'un ensemble de tous les ID de thèmes
    const allThemeIds = new Set(themes.map((theme: any) => theme.id));
    // Construction d'un ensemble des ID de thèmes avec enfants
    const themesWithChildrenIds = new Set(
      themes
        .filter((theme: any) => theme.parentId)
        .map((theme: any) => theme.parentId)
    );

    // Initialisation des listes d'erreurs
    let errors: Errors = {
      inexistants: [],
      avecEnfants: [],
    };

    keywords.forEach((keyword: any) => {
      keyword.themeIds.forEach((themeId: any) => {
        if (!allThemeIds.has(themeId)) {
          // Le themeId n'existe pas
          if (!errors.inexistants.includes(keyword.name)) {
            errors.inexistants.push(keyword.name);
          }
        } else if (themesWithChildrenIds.has(themeId)) {
          // Le themeId correspond à un thème ayant des enfants
          if (!errors.avecEnfants.includes(keyword.name)) {
            errors.avecEnfants.push(keyword.name);
          }
        }
      });
    });

    return errors;
  }

  // Build by merging theme.json and keywords.json files
  static buildCompleteHierarchy(
    generalKeywords: string[],
    keywordsSource: any[],
    themesSource: any[]
  ) {
    // retirer les mots-clés inconnues
    const _keywords = keywordsSource.filter((kw: any) =>
      generalKeywords.find((k) => k === kw.name)
    );

    const tt = buildThemeHierarchy(_keywords, themesSource);
    return removeThemesWithoutKeywords(tt);
  }

  static buildFinalTree(
    references: Reference[],
    keywordsFile: any,
    themesFile: any
  ) {
    const rootKeywords = KeywordService.extractAllKeywords(references);
    return HierarchyService.buildCompleteHierarchy(
      rootKeywords,
      keywordsFile,
      themesFile
    );
  }
}

// Private

function removeThemesWithoutKeywords(themes: any[]) {
  // Vérifie récursivement si le thème ou ses enfants ont des mots-clés
  function hasKeywordsOrChildrenWithKeywords(theme: any) {
    // Vérifie d'abord si le thème actuel a des mots-clés
    if (theme.data && theme.data.length > 0) {
      return true;
    }
    // Si le thème actuel n'a pas de mots-clés, vérifie récursivement ses enfants
    return theme.children.some((child: any) =>
      hasKeywordsOrChildrenWithKeywords(child)
    );
  }

  // Filtre les thèmes qui n'ont pas de mots-clés et applique cette logique récursivement à leurs enfants
  function filterThemes(themes: any) {
    return themes.reduce((filteredThemes: any, theme: any) => {
      // Applique le filtrage récursif aux enfants d'abord
      theme.children = filterThemes(theme.children);
      // Si le thème ou ses enfants (après filtrage) ont des mots-clés, il est conservé
      if (hasKeywordsOrChildrenWithKeywords(theme)) {
        filteredThemes.push(theme);
      }
      return filteredThemes;
    }, []);
  }

  return filterThemes(themes);
}

function buildThemeHierarchy(keywords: any[], themes: any[]) {
  // Étape 1: Intégrer les mots-clés dans les thèmes
  themes.forEach((theme) => {
    theme.data = keywords
      .filter((keyword) => keyword.themeIds.includes(theme.id))
      .map((keyword) => keyword.name);
    theme.children = []; // Préparer la propriété pour les enfants
  });

  // Étape 2: Construire la hiérarchie des thèmes
  const themesHierarchy = themes.reduce((acc, theme) => {
    if (theme.parentId) {
      const parentTheme = themes.find((t) => t.id === theme.parentId);
      if (parentTheme) {
        // Formater le thème enfant selon le modèle
        const childTheme = {
          key: theme.id,
          label: theme.name,
          children: [],
          data: theme.data,
        };
        parentTheme.children.push(childTheme);
      }
    } else {
      // Si le thème n'a pas de parentId, il est à la racine de la hiérarchie
      acc.push({
        key: theme.id,
        label: theme.name,
        children: theme.children, // Ici, on ajoutera les enfants plus tard
        data: theme.data,
      });
    }
    return acc;
  }, []);

  // Étape 3: Assignation récursive des enfants (si nécessaire)
  const assignChildrenRecursively = (themeList: any) => {
    themeList.forEach((theme: any) => {
      theme.children = themes
        .filter((t) => t.parentId === theme.key)
        .map((t) => ({
          key: t.id,
          label: t.name,
          children: [], // Les enfants seront ajoutés dans des itérations subséquentes
          data: t.data,
        }));
      if (theme.children.length > 0) {
        assignChildrenRecursively(theme.children);
      }
    });
  };

  // Commencer l'assignation à partir de la racine
  assignChildrenRecursively(themesHierarchy);

  return themesHierarchy;
}
