// src/index
import React from '../fiber-react';

const element = (
  <div>
    <h1>
      <p>我是P标签</p>
      <a />
    </h1>
    <h2 />
  </div>
)

console.log(element)

React.render(element, document.getElementById('root'))
