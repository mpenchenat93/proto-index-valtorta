import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { UtilsService } from 'src/app/services/utils.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(private utils: UtilsService) {}

  expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  filterNodes(value: string, nodes: TreeNode[]): TreeNode[] {
    let filteredNodes: TreeNode[] = [];

    for (let node of nodes) {
      const a = this.utils.getLowerCaseWithNormalize(node.label || '');
      const b = this.utils.getLowerCaseWithNormalize(value);
      if (a.includes(b)) {
        filteredNodes.push(node);
      } else if (node.children) {
        let filteredChildren = this.filterNodes(value, node.children);
        if (filteredChildren.length > 0) {
          filteredNodes.push({ ...node, children: filteredChildren });
        }
      }
    }

    return filteredNodes;
  }
}
