*** Settings ***
Resource        ../_resources/keywords/Server.robot
Resource        ../_resources/keywords/Browser.robot
Resource        ../_resources/keywords/Lab.robot
Resource        ../_resources/keywords/IPyForceGraph.robot
Resource        ../_resources/keywords/Screenshots.robot
Library         Collections
Library         JupyterLibrary
Library         OperatingSystem

Force Tags      suite:shapes:links


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api${/}link_shapes


*** Test Cases ***
ForceGraph3D Can Set Link color to str('blue')
    Shape Link Feature Works As Expected    ForceGraph3D    color    str    blue    1

ForceGraph3D Can Set Link color to B.Column('link_color')
    Shape Link Feature Works As Expected    ForceGraph3D    color    B.Column    link_color    2

ForceGraph3D Can Set Link color to B.Nunjucks('{{ link.link_color }}')
    Shape Link Feature Works As Expected    ForceGraph3D    color    B.Nunjucks    {{ link.link_color }}    3

ForceGraph3D Can Set Link curvature to int('1')
    Shape Link Feature Works As Expected    ForceGraph3D    curvature    int    1    1

ForceGraph3D Can Set Link curvature to float('2.5')
    Shape Link Feature Works As Expected    ForceGraph3D    curvature    float    2.5    2

ForceGraph3D Can Set Link curvature to B.Column('value')
    Shape Link Feature Works As Expected    ForceGraph3D    curvature    B.Column    value    3

ForceGraph3D Can Set Link curvature to B.Nunjucks('{{ link.value * 1.5 }}')
    Shape Link Feature Works As Expected    ForceGraph3D    curvature    B.Nunjucks    {{ link.value * 1.5 }}    4

ForceGraph3D Can Set Link line_dash to B.Nunjucks('{{ [10, 2, 10] }}')
    Shape Link Feature Works As Expected    ForceGraph3D    line_dash    B.Nunjucks    {{ [10, 2, 10] }}    1

ForceGraph3D Can Set Link width to int('2')
    Shape Link Feature Works As Expected    ForceGraph3D    width    int    2    1

ForceGraph3D Can Set Link width to float('3.5')
    Shape Link Feature Works As Expected    ForceGraph3D    width    float    3.5    2

ForceGraph3D Can Set Link width to B.Column('value')
    Shape Link Feature Works As Expected    ForceGraph3D    width    B.Column    value    3

ForceGraph3D Can Set Link width to B.Nunjucks('{{ link.value * 0.5 }}')
    Shape Link Feature Works As Expected    ForceGraph3D    width    B.Nunjucks    {{ link.value * 0.5 }}    4


*** Keywords ***
Shape Link Feature Works As Expected
    [Arguments]    ${widget_class}    ${feature}    ${input_type}    ${value}    ${idx}
    ${screens} =    Set Variable
    ...    ${SCREENS}${/}${widget_class.lower()}${/}${feature.lower()}${/}${input_type.split(".")[-1]}${/}${idx}
    Maybe Skip A Test
    ...    widget_class=${widget_class}
    ...    feature=${feature}
    ...    input_type=${input_type}
    ...    value=${value}
    Set Screenshot Directory    ${screens}
    Set Up Link Shape Example    ${widget_class}    ${feature}    ${input_type}    ${value}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    01-screenshot.png
    # Update Link Shape Feature    ${widget_class}    ${shape_class}    ${feature}
    # ${color} =    Get Element Screenshot Size    ${frame}    ${screens}    02-color.png
    # Should Be True Or Screenshot    ${color} > ${transparent}    03-color-bigger-than-transparent.png
    [Teardown]    Clean Up Link Shape Example

Update Link Shape Feature
    [Arguments]    ${widget_class}    ${shape_class}    ${feature}
    Add And Run JupyterLab Code Cell    shape.${feature} = "rgba(255, 0, 0, 1.0)"
    IF    "${shape_class}" == "Rectangle"
        Add And Run JupyterLab Code Cell    shape.opacity = 1
    END
    Wait For All Cells To Run
    Sleep    1s

Set Up Link Shape Example
    [Arguments]    ${widget_class}    ${feature}    ${input_type}    ${value}
    Set Tags
    ...    feature:${feature}
    ...    widget:${widget_class.lower()}
    ...    input_type:${input_type.lower()}
    ...    value:${value.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}LinkShapes.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    ${text} =    Set Variable    ${text.replace("FEATURE", "${feature}")}
    ${text} =    Set Variable    ${text.replace("INPUT_TYPE", "${input_type}")}
    ${text} =    Set Variable    ${text.replace("VALUE", "${value}")}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Link Shape Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
