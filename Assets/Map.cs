using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public class Map : MonoBehaviour {

    public void Start()
    {
        foreach (var graphNode in CreateSampleGraph())
        {
            Debug.Log(graphNode);
        }
    }
    
    private GraphNode CreateSampleGraph()
    {
        int[][] sampleNodeConnections = {
            new[] {1, 5, 9, 11}, // 0
            new[] {2, 3, 4}, // 1
            new[] {1, 5}, // 2
            new[] {1}, // 3
            new[] {1}, // 4
            new[] {0, 2, 6, 7}, // 5
            new[] {5}, // 6
            new[] {5}, // 7
            new[] {9}, // 8
            new[] {0, 8, 10}, // 9
            new[] {9}, // 10
            new[] {0, 12, 13}, // 11
            new[] {11}, // 12
            new[] {11}, // 13
        };

        Dictionary<uint, GraphNode> nodeMap = new Dictionary<uint, GraphNode>();

        for (uint i = 0; i < sampleNodeConnections.Length; i++)
        {
            nodeMap[i] = new GraphNode(i);
        }

        for (uint i = 0; i < sampleNodeConnections.Length; i++)
        {
            foreach (var connection in sampleNodeConnections[i])
            {
                nodeMap[i].connected.Add((uint) connection, nodeMap[(uint) connection]);
            }
        }

        return nodeMap[0];
    }
}