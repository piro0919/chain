export type OrgNode = {
  children: OrgNode[];
  department?: string;
  name: string;
  position?: string;
};

export function parseMarkdown(markdown: string): OrgNode[] {
  const lines = markdown.split("\n").filter((line) => line.trim() !== "");
  const root: OrgNode[] = [];
  const stack: { indent: number; node: OrgNode }[] = [];

  for (const line of lines) {
    const match = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (!match) continue;

    const indent = match[1].length;
    const content = match[2].trim();

    // Parse bold text as department marker: **Department**
    const boldMatch = content.match(/^\*\*(.+?)\*\*(?:\s*\((.+)\))?$/);
    // Parse "Name (Position)" format
    const namePositionMatch = content.match(/^(.+?)\s*\((.+)\)$/);

    let name: string;
    let position: string | undefined;
    let department: string | undefined;

    if (boldMatch) {
      name = boldMatch[1].trim();
      position = boldMatch[2]?.trim();
      department = name;
    } else if (namePositionMatch) {
      name = namePositionMatch[1].trim();
      position = namePositionMatch[2].trim();
    } else {
      name = content;
    }

    const node: OrgNode = { children: [], department, name, position };

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      // Inherit department from parent if not set
      if (!node.department && stack[stack.length - 1].node.department) {
        node.department = stack[stack.length - 1].node.department;
      }
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ indent, node });
  }

  return root;
}
