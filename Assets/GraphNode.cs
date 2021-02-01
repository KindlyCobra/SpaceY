 using System;
 using System.Collections;
 using System.Collections.Generic;
 using System.Linq;
 using System.Text;

 public class GraphNode: IEnumerable<GraphNode>
 {
     public uint id { get; }

     public Dictionary<uint, GraphNode> connected = new Dictionary<uint, GraphNode>();
     // TODO: Should run generation algorithm and then memoize result as neighbor connections can't change

     public GraphNode(uint id)
     {
         this.id = id;
     }

     public IEnumerator<GraphNode> GetEnumerator()
     {
         var toVisit = new Dictionary<uint, GraphNode>();
         var visited = new List<uint>();
         var current = this;

         do
         {
             visited.Add(current.id);
             yield return current;
             foreach (var graphNode in current.connected.Values.Where(node => !visited.Contains(node.id)))
             {
                 toVisit[graphNode.id] = graphNode;
             }

             current = toVisit.First().Value;
             toVisit.Remove(current.id);
         } while (toVisit.Count > 0);
     }

     IEnumerator IEnumerable.GetEnumerator()
     {
         return GetEnumerator();
     }

     public override string ToString()
     {
         return $"{id} => [{connected.Values.Aggregate(new StringBuilder(), (acc, node) => acc.Append(node.id).Append(", "))}]";
     }
 }