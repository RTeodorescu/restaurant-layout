import "./App.css";
import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric'; // v6
import DownloadJSON from './DownloadJSON';

class LabeledRect extends fabric.Rect {
  constructor(options) {
    options = options || {};
    super(options);
    this.label = options.label;

  }
  // toObject(properties) {
  //   let ret = super.toObject(properties);
  //   ret['label'] = this.label;
  //   return ret;
  // }

  _render(ctx) {
    super._render(ctx);
    ctx.font = '15px Helvetica';
    ctx.fillStyle = 'black';
    ctx.fillText(this.label, -this.width/2 + 20, -this.height/2 + 20);
  }
};

export const App = () => {
  const [canvas, setCanvas] = useState('');
  const [selectedObject, setSelectedObject] = useState('');
  const [snapshotJSON, setSnapshotJSON] = useState('');
  const [loadedJSON, setLoadedJSON] = useState('');

  useEffect(() => {
    const options = { 
      width: 500,
      height: 500,
      backgroundColor: 'gray'
      };
    const canvas = new fabric.Canvas('canvas', options);
    canvas.selectionColor = 'rgba(0,255,0,0.3)';
    canvas.selectionBorderColor = 'red';
    canvas.selectionLineWidth = 5;
    canvas.on("mouse:down", handleMouseDown);

    setCanvas(canvas);
    canvas.renderAll();

    return () => {
      canvas.dispose();
    }
  }, []);

  const addSquare = parentCanvas => {
    const shape = new LabeledRect({
      top: 50,
      left: 50,
      height: 80,
      width: 80,
      strokeWidth: 1,
      stroke: 'blue',
      fill: 'white',
      label: 'Table'
    });
    parentCanvas.add(shape);
    parentCanvas.renderAll();
  }

  const addDiamond = parentCanvas => {
    const shape = new LabeledRect({
      top: 50,
      left: 50,
      height: 80,
      width: 80,
      strokeWidth: 1,
      stroke: 'blue',
      fill: 'white',
      angle: -45,
      label: 'Table'
    });
    parentCanvas.add(shape);
    parentCanvas.renderAll();
  }

  // const addGroup = parentCanvas => {
  //   const circle = new fabric.Circle({
  //     radius: 100,
  //     fill: '#eef',
  //     scaleY: 0.5,
  //     originX: 'center',
  //     originY: 'center'
  //   });
    
  //   const text = new fabric.Textbox('hello world', {
  //     fontSize: 30,
  //     originX: 'center',
  //     originY: 'center'
  //   });
    
  //   const group = new fabric.Group([ circle, text ], {
  //     left: 150,
  //     top: 100,
  //     angle: -10
  //   });
    
  //   parentCanvas.add(group);
  //   parentCanvas.renderAll();
  // }

  const addText = parentCanvas => {
    const text = new fabric.Textbox('Table', {
      fontSize: 20,
      originX: 'center',
      originX: 'center' 
    });
    parentCanvas.add(text);
    parentCanvas.renderAll();
  }

  const clearCanvas = parentCanvas => {
    parentCanvas.remove(...canvas.getObjects());
    setSelectedObject('');
  }

  const handleMouseDown = event => {
    if (event.target) {
      setSelectedObject(event.target);
      console.log(event.target);
    } else {
      setSelectedObject('');
    }
  }

  const deleteSelection = (parentCanvas, obj) => {
    if (obj) {
      parentCanvas.remove(obj);
      setSelectedObject('');
    }
  }

  const takeSnapshotJSON = parentCanvas => {
    let json = JSON.stringify(parentCanvas.toObject(['label']));
    setSnapshotJSON(json);
  }

  const handleChange = e => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      setLoadedJSON(e.target.result);
    };
  }

  const restoreFromLoadedFile = parentCanvas => {
    let arrOriginal = [];
    let arr = [];
    canvas.loadFromJSON(loadedJSON, function(o, object) {
      arrOriginal.push(object);
      arr.push(new LabeledRect(o));
    }).then(
      (canvas) =>
      {
        for (var item of arrOriginal) {
          canvas.remove(item);
        }

        for (var item of arr) {
          canvas.add(item);
        }
        canvas.requestRenderAll();
      }
      );
  }

  return(
    <div className='Canvas'>
      <h1>Restaurant Layout</h1>
      <div className='Buttons'>
        <button onClick={() => addSquare(canvas)}>Square</button>
        <button onClick={() => addDiamond(canvas)}>Diamond</button>
        <button onClick={() => addText(canvas)}>Label Table</button>
        <button onClick={() => clearCanvas(canvas)}>Clear Canvas</button>
        {/* <button onClick={() => addGroup(canvas)}>Group</button> */}
        <button onClick={() => deleteSelection(canvas, selectedObject)}>Delete Selection</button>
        <button onClick={() => takeSnapshotJSON(canvas, selectedObject)}>Snapshot JSON</button>
        <DownloadJSON data={snapshotJSON} fileName="canvasJSON" />
        <input type="file" onChange={handleChange} />
        <button onClick={() => restoreFromLoadedFile(canvas)}>Restore From Loaded File</button>

      </div>

      <div>
        <canvas id="canvas" />
      </div>
    </div>
  );
};

export default App;
