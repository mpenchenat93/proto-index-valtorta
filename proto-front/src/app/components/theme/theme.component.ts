import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { TreeNode } from 'primeng/api';

import { PTreeService } from './p-tree.service';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ThemeComponent implements OnChanges {
  @Input() themeTree: TreeNode[];
  @Input() set resetSearchKeyword(value: number) {
    if (value) {
      this.searchTheme = '';
      this.selectedNodes = [];
      this.selectedKeys = [];
    }
  }

  @Output() selectedThemeKeywordsEv: EventEmitter<string[]> =
    new EventEmitter();

  filteredNodes: TreeNode[] = [];
  selectedNodes: TreeNode[] = [];

  searchTheme = '';

  // Copy
  selectedKeys: string[] = [];
  // --

  hidden = true;

  constructor(
    private themeService: ThemeService,
    private pTreeService: PTreeService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['themeTree']) {
      this.filteredNodes = [];
      this.selectedNodes = [];
      this.loadThemes();
    }
  }

  onFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (!value) {
      this.filteredNodes = this.themeTree;
    } else {
      this.filteredNodes = this.themeService.filterNodes(value, this.themeTree);
    }
  }

  onNodeChange() {
    const _themesKeywords = this.pTreeService.getSelectedThemeKeywords(
      this.selectedNodes
    );

    this.saveChanges();
    this.selectedThemeKeywordsEv.emit(_themesKeywords);
  }

  // IHM

  expandAll() {
    if (this.themeTree)
      this.themeTree.forEach((node) => {
        this.themeService.expandRecursive(node, true);
      });
  }

  collapseAll() {
    if (this.themeTree)
      this.themeTree.forEach((node) => {
        this.themeService.expandRecursive(node, false);
      });
  }

  toggle() {
    this.hidden = !this.hidden;
  }

  // ---- PRIVATE

  private async loadThemes() {
    this.reduceCopyChanges(this.themeTree);
    this.selectNodeProgrammatically();
    this.removeIncorrectSelectedNode();
    this.applyPartialSectionWhereNecessary();
    this.applySectionWhereNecessary();

    this.filteredNodes = this.themeTree;
    this.expandAll();

    setTimeout(() => {
      const _themesKeywords = this.pTreeService.getSelectedThemeKeywords(
        this.selectedNodes
      );
      this.selectedThemeKeywordsEv.emit(_themesKeywords);
    });
  }

  private saveChanges() {
    this.selectedKeys = this.selectedNodes.map((selection: TreeNode) => {
      return selection.key || '';
    });
  }

  private reduceCopyChanges(nodes: TreeNode[]) {
    const allKeys = this.pTreeService.extractKeysFromTreeNodes(nodes);

    this.selectedKeys = this.selectedKeys.filter((key) => {
      return allKeys.includes(key);
    });
  }

  private selectNodeProgrammatically() {
    const nodesToSelect = this.selectedKeys.map((key) => {
      return this.pTreeService.findNode(this.themeTree, key) || {};
    });

    if (nodesToSelect) {
      this.selectedNodes = nodesToSelect;
    }
  }

  private findIncorrectlySelectedParents(
    selectedKeys: string[],
    nodes: TreeNode[]
  ) {
    let incorrectlySelectedParents = new Set<string>();

    function checkNode(node: TreeNode): boolean {
      if (!node.children || node.children.length === 0) {
        return selectedKeys.includes(node.key || '');
      }
      let childSelectedStatuses = node.children.map(checkNode);
      let isNodeSelected = selectedKeys.includes(node.key || '');
      if (isNodeSelected && childSelectedStatuses.includes(false)) {
        incorrectlySelectedParents.add(node.key!);
      }
      return (
        isNodeSelected ||
        childSelectedStatuses.every((status) => status === true)
      );
    }

    nodes.forEach(checkNode);
    return Array.from(incorrectlySelectedParents);
  }

  private findNodesForPartialSelection(
    selectedKeys: string[],
    nodes: TreeNode[]
  ): string[] {
    const nodesForPartialSelection = new Set<string>();

    function checkNode(node: TreeNode): boolean {
      if (!node.children || node.children.length === 0) {
        return selectedKeys.includes(node.key || '');
      }

      const childSelectionStates = node.children.map(checkNode);
      const isNodeSelected = selectedKeys.includes(node.key || '');
      const shouldMarkPartial =
        childSelectionStates.includes(false) &&
        (isNodeSelected || childSelectionStates.includes(true));

      if (shouldMarkPartial) {
        nodesForPartialSelection.add(node.key!);
      }

      return (
        isNodeSelected || childSelectionStates.some((status) => status === true)
      );
    }

    nodes.forEach(checkNode);

    return Array.from(nodesForPartialSelection);
  }

  private applyPartialSectionWhereNecessary() {
    this.selectedKeys = this.selectedNodes.map(
      (node: TreeNode) => node.key || ''
    );

    const incorrectKeys2 = this.findNodesForPartialSelection(
      this.selectedKeys,
      this.themeTree
    );

    this.pTreeService.applySelection(this.themeTree, incorrectKeys2, false);
  }

  private applySectionWhereNecessary() {
    this.selectedKeys = this.selectedNodes.map(
      (node: TreeNode) => node.key || ''
    );

    const keysToSelect = this.findNodesToSelect(
      this.selectedKeys,
      this.themeTree
    );

    this.selectedNodes = this.selectedNodes.concat(
      this.findNodesByKeys(this.themeTree, keysToSelect)
    );
  }

  private removeIncorrectSelectedNode() {
    const incorrectKeys = this.findIncorrectlySelectedParents(
      this.selectedKeys,
      this.themeTree
    );

    this.selectedNodes = this.selectedNodes.filter(
      (node: TreeNode) => !incorrectKeys.includes(node.key || '')
    );
  }

  private findNodesToSelect(
    selectedKeys: string[],
    nodes: TreeNode[]
  ): string[] {
    const nodesToSelect = new Set<string>();

    function checkAllChildrenSelected(
      node: TreeNode,
      selectedKeys: string[]
    ): boolean {
      // Si le nœud est déjà sélectionné, pas besoin de vérifier ses enfants
      if (selectedKeys.includes(node.key || '')) {
        return true;
      }

      if (!node.children || node.children.length === 0) {
        return false; // Pas de sélection automatique pour les nœuds feuilles non sélectionnés
      }

      const childrenAllSelected = node.children.every((child) =>
        checkAllChildrenSelected(child, selectedKeys)
      );

      if (childrenAllSelected) {
        nodesToSelect.add(node.key || ''); // Tous les enfants sont sélectionnés, donc ce nœud devrait l'être aussi
      }

      return childrenAllSelected;
    }

    nodes.forEach((node) => checkAllChildrenSelected(node, selectedKeys));

    return Array.from(nodesToSelect);
  }

  private findNodesByKeys(nodes: TreeNode[], keys: string[]) {
    const foundNodes: TreeNode[] = [];

    function searchNodes(currentNodes: TreeNode[]) {
      for (const node of currentNodes) {
        if (keys.includes(node.key || '')) {
          foundNodes.push(node);
        }
        if (node.children && node.children.length > 0) {
          searchNodes(node.children);
        }
      }
    }

    searchNodes(nodes);
    return foundNodes;
  }
}
