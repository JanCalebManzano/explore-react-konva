import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { ArrowConfig } from "konva/lib/shapes/Arrow";
import { CircleConfig } from "konva/lib/shapes/Circle";
import { TextConfig } from "konva/lib/shapes/Text";
import { Vector2d } from "konva/lib/types";
import { Fragment, useState } from "react";
import { Arrow, Circle, Layer, Stage, Text } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

interface ShapeNode extends Vector2d {
  parentkey?: string;
  visible?: boolean;
}

const RADIUS = 50;

const circleConfig: CircleConfig = {
  stroke: "black",
  fill: "skyblue",
  radius: RADIUS,
  scale: { x: 0.75, y: 0.75 },
  draggable: true,
  filters: [Konva.Filters.Noise],
  noise: 0.5,
  onDragStart: ({ currentTarget }: KonvaEventObject<MouseEvent>) =>
    currentTarget.scale({ x: 0.9, y: 0.9 }),
  onDragEnd: ({ currentTarget }: KonvaEventObject<MouseEvent>) =>
    currentTarget.scale({ x: 0.75, y: 0.75 }),
};

const connectorConfig: ArrowConfig = {
  points: [],
  stroke: "gray",
  fill: "gray",
  pointerLength: 10,
};

const buttonConfig: TextConfig = {
  text: "+ Add child circle",
  onMouseDown: (evt: KonvaEventObject<MouseEvent>) =>
    evt.currentTarget.setAttr("fill", "red"),
  onMouseUp: (evt: KonvaEventObject<MouseEvent>) =>
    evt.currentTarget.setAttr("fill", "black"),
  fill: "black",
};

const App = () => {
  const [nodes, setNodes] = useState<Record<string, ShapeNode>>({});

  const [tempNode, setTempNode] = useState<ShapeNode>({
    x: 500,
    y: 500,
    visible: false,
  });

  const addChildNodeStart = (pointerPos?: Vector2d, key?: string) =>
    setTempNode({ ...tempNode, ...pointerPos, visible: true, parentkey: key });

  const addChildNodeEnd = () => {
    if (!tempNode.visible) return;

    setTempNode({ ...tempNode, visible: false });
    setNodes({
      ...nodes,
      [uuidv4()]: {
        x: tempNode.x,
        y: tempNode.y,
        parentkey: tempNode.parentkey,
      },
    });
  };

  const getConnectorPoints = (from: Vector2d, to: Vector2d) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(-dy, dx);

    return [
      from.x + -RADIUS * Math.cos(angle + Math.PI),
      from.y + RADIUS * Math.sin(angle + Math.PI),
      to.x + -RADIUS * Math.cos(angle),
      to.y + RADIUS * Math.sin(angle),
    ];
  };

  const renderNodes = () =>
    Object.keys(nodes).map((key) => {
      const node = nodes[key];
      let connector = undefined;

      if (!!node.parentkey) {
        connector = (
          <Arrow
            {...connectorConfig}
            points={getConnectorPoints(nodes[node.parentkey], node)}
          />
        );
      }

      return (
        <Fragment key={key}>
          {connector}

          <Circle
            {...circleConfig}
            {...node}
            onDragMove={({ target }) =>
              setNodes({
                ...nodes,
                [key]: { ...nodes[key], ...target.position() },
              })
            }
            onClick={({ currentTarget }) =>
              currentTarget.setAttr("fill", Konva.Util.getRandomColor()) &&
              currentTarget.cache()
            }
          />

          <Text
            {...buttonConfig}
            x={node.x + 25}
            y={node.y + 50}
            onClick={({ target }) => addChildNodeStart(target.position(), key)}
          />
        </Fragment>
      );
    });

  return (
    <div className="App">
      <div style={{ minHeight: "50px" }}>
        {!tempNode.visible && (
          <button
            onClick={(evt) => addChildNodeStart({ x: evt.pageX, y: evt.pageY })}
          >
            + Add parent circle
          </button>
        )}
      </div>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseMove={({ target }) =>
          tempNode.visible &&
          setTempNode({
            ...tempNode,
            ...target.getStage()?.getPointerPosition(),
          })
        }
        onClick={() => addChildNodeEnd()}
      >
        <Layer>
          {renderNodes()}

          <Circle
            {...tempNode}
            stroke="black"
            fill="gray"
            radius={RADIUS}
            opacity={0.4}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
