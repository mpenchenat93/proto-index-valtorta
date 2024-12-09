import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class PTreeService {
  constructor() {}

  getSelectedThemeKeywords(selectedNodes: TreeNode[]): string[] {
    let resultats: string[] = [];

    selectedNodes.forEach((node: any) => {
      resultats = resultats.concat(node.data);
    });

    return [...new Set(resultats)];
  }

  // Retourne la liste des key[]
  extractKeysFromTreeNodes(nodes: TreeNode[]): string[] {
    let keys: string[] = [];

    function traverse(node: TreeNode) {
      if (node.key) {
        keys.push(node.key);
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => traverse(child));
      }
    }

    nodes.forEach((node) => traverse(node));
    return keys;
  }

  // Get node by given key
  findNode(nodes: TreeNode[], key: string): TreeNode | null {
    for (let node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = this.findNode(node.children, key);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Select programmaticaly
  applySelection(
    nodes: TreeNode[],
    selectedKeys: string[],
    isFullySelected: boolean
  ) {
    for (let node of nodes) {
      const matchingNode = selectedKeys.find((key) => key === node.key);

      if (matchingNode) {
        if (isFullySelected) {
          node.partialSelected = false;
        } else {
          node.partialSelected = true;
        }
      }
      if (node.children) {
        this.applySelection(node.children, selectedKeys, isFullySelected);
      }
    }
  }

  findPartialSelectedNodes(
    nodes: TreeNode[],
    partialSelectedNodes: TreeNode[] = []
  ) {
    nodes.forEach((node: TreeNode) => {
      if (node.partialSelected) {
        partialSelectedNodes.push(node);
      }
      if (node.children) {
        this.findPartialSelectedNodes(node.children, partialSelectedNodes);
      }
    });
    return partialSelectedNodes;
  }
}
