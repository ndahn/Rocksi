import * as Blockly from "blockly";

// blockly/core/field.js
Blockly.Field.prototype.fromXml = function (fieldElement) {
  this.setValue(
    Blockly.utils.replaceMessageReferences(fieldElement.textContent)
  );
};

// blockly/core/xml.js
Blockly.Xml.domToVariables = function (xmlVariables, workspace) {
  for (var i = 0, xmlChild; (xmlChild = xmlVariables.childNodes[i]); i++) {
    if (xmlChild.nodeType != Blockly.utils.dom.NodeType.ELEMENT_NODE) {
      continue; // Skip text nodes.
    }
    var type = xmlChild.getAttribute("type");
    var id = xmlChild.getAttribute("id");
    var name = Blockly.utils.replaceMessageReferences(xmlChild.textContent);

    workspace.createVariable(name, type, id);
  }
};

// blockly/core/xml.js
Blockly.Xml.applyCommentTagNodes_ = function (xmlChildren, block) {
  for (var i = 0, xmlChild; (xmlChild = xmlChildren[i]); i++) {
    var text = Blockly.utils.replaceMessageReferences(xmlChild.textContent);
    var pinned = xmlChild.getAttribute("pinned") == "true";
    var width = parseInt(xmlChild.getAttribute("w"), 10);
    var height = parseInt(xmlChild.getAttribute("h"), 10);

    block.setCommentText(text);
    block.commentModel.pinned = pinned;
    if (!isNaN(width) && !isNaN(height)) {
      block.commentModel.size = new Blockly.utils.Size(width, height);
    }

    if (pinned && block.getCommentIcon && !block.isInFlyout) {
      setTimeout(function () {
        block.getCommentIcon().setVisible(true);
      }, 1);
    }
  }
};

// blockly/core/xml.js
Blockly.Xml.applyDataTagNodes_ = function (xmlChildren, block) {
  for (var i = 0, xmlChild; (xmlChild = xmlChildren[i]); i++) {
    block.data = Blockly.utils.replaceMessageReferences(xmlChild.textContent);
  }
};
