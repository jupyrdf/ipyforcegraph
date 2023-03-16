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
ForceGraph3D Can Set Link color using str inputs
    Shape Link Feature Works As Expected    ForceGraph3D    color    str    blue    red    1

ForceGraph3D Can Set Link color using Column inputs
    Shape Link Feature Works As Expected    ForceGraph3D    color    Column    a_color    other_color    2

ForceGraph3D Can Set Link color using Nunjucks inputs
    Shape Link Feature Works As Expected
    ...    ForceGraph3D
    ...    color
    ...    Nunjucks
    ...    {{ link.a_color }}
    ...    {{ link.other_color }}
    ...    3

ForceGraph3D Can Set Link curvature using int inputs
    Shape Link Feature Works As Expected    ForceGraph3D    curvature    int    1    2    1

ForceGraph3D Can Set Link curvature using float inputs
    Shape Link Feature Works As Expected    ForceGraph3D    curvature    float    1.5    3.0    2

ForceGraph3D Can Set Link curvature using Column inputs
    Shape Link Feature Works As Expected    ForceGraph3D    curvature    Column    value_small    value_large    3

ForceGraph3D Can Set Link curvature using Nunjucks inputs
    Shape Link Feature Works As Expected
    ...    ForceGraph3D
    ...    curvature
    ...    Nunjucks
    ...    {{ link.value_small * 0.5 }}
    ...    {{ link.value_large * 1.5 }}
    ...    4

ForceGraph3D Can Set Link line_dash using Nunjucks inputs
    Shape Link Feature Works As Expected
    ...    ForceGraph3D
    ...    line_dash
    ...    Nunjucks
    ...    {{ [10, 2, 10] }}
    ...    {{ [20, 2, 20] }}
    ...    1

ForceGraph3D Can Set Link width using int inputs
    Shape Link Feature Works As Expected    ForceGraph3D    width    int    2    5    1

ForceGraph3D Can Set Link width using float inputs
    Shape Link Feature Works As Expected    ForceGraph3D    width    float    0.5    2.5    2

ForceGraph3D Can Set Link width using Column inputs
    Shape Link Feature Works As Expected    ForceGraph3D    width    Column    value_small    value_large    3

ForceGraph3D Can Set Link width using Nunjucks inputs
    Shape Link Feature Works As Expected
    ...    ForceGraph3D
    ...    width
    ...    Nunjucks
    ...    {{ link.value_small * 0.5 }}
    ...    {{ link.value_large * 1.5 }}
    ...    4


*** Keywords ***
Shape Link Feature Works As Expected
    [Arguments]    ${widget_class}    ${feature}    ${input_type}    ${initial_value}    ${updated_value}    ${idx}
    ${screens} =    Set Variable
    ...    ${SCREENS}${/}${widget_class.lower()}${/}${feature.lower()}${/}${input_type.lower()}${/}${idx}
    Maybe Skip A Test
    ...    widget_class=${widget_class}
    ...    feature=${feature}
    ...    input_type=${input_type}
    ...    value=${initial_value}
    Set Screenshot Directory    ${screens}

    Set Up Link Shape Example    ${widget_class}    ${feature}    ${input_type}    ${initial_value}

    Maybe Skip A Test
    ...    widget_class=${widget_class}
    ...    feature=${feature}
    ...    input_type=${input_type}
    ...    value=${updated_value}

    Add And Run JupyterLab Code Cell    lsb.${feature} = ${input_type}("${updated_value}")
    Capture Page Screenshot    01-updated-value.png

    Add And Run JupyterLab Code Cell    gd.capturing = True
    Add And Run JupyterLab Code Cell    await asyncio.sleep(1)
    Add And Run JupyterLab Code Cell    assert 0 not in gd.sources[0].nodes.shape
    Add And Run JupyterLab Code Cell    assert 0 not in gd.sources[0].links.shape

    IF    "${feature}" == "color"
        Link Shape Color As Expected    ${screens}    ${input_type}    ${updated_value}
    END

    [Teardown]    Clean Up Link Shape Example

Link Shape Color As Expected
    [Arguments]    ${screens}    ${input_type}    ${value}
    ${frame} =    Set Variable    css:${IPYFORCEGRAPH FRAME}
    Add And Run JupyterLab Code Cell    lsb.color = "rgba(0,0,0,0)"
    ${transparent} =    Get Element Screenshot Size    ${frame}    ${screens}    02-transparent.png
    Add And Run JupyterLab Code Cell    lsb.color = ${input_type}("${value}")
    ${color} =    Get Element Screenshot Size    ${frame}    ${screens}    03-color.png
    Should Be True Or Screenshot    ${color} > ${transparent}    03-color-bigger-than-transparent.png
    Add And Run JupyterLab Code Cell    lb.color = "rgba(40, 120, 120, 1.0)"
    Wait For All Cells To Run
    Sleep    1s
    Capture Page Screenshot    02-color-updated.png

Set Up Link Shape Example
    [Arguments]    ${widget_class}    ${feature}    ${input_type}    ${initial_value}
    Set Tags    feature:${feature}    widget:${widget_class.lower()}    input_type:${input_type.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}LinkShapes.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    ${text} =    Set Variable    ${text.replace("FEATURE", "${feature}")}
    ${text} =    Set Variable    ${text.replace("INPUT_TYPE", "${input_type}")}
    ${text} =    Set Variable    ${text.replace("INITIAL_VALUE", "${initial_value}")}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Clean Up Link Shape Example
    Capture Page Screenshot    99-final.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
