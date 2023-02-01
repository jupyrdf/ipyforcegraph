*** Settings ***
Resource        ../_resources/keywords/Server.robot
Resource        ../_resources/keywords/Browser.robot
Resource        ../_resources/keywords/Lab.robot
Resource        ../_resources/keywords/IPyForceGraph.robot
Library         Collections
Library         JupyterLibrary
Library         OperatingSystem

Force Tags      suite:colors


*** Variables ***
${SCREENS}      ${SCREENS ROOT}${/}api


*** Test Cases ***
Colors Can Update
    [Template]    Color Feature Works As Expected
    background_color    ForceGraph
    background_color    ForceGraph3D
    default_link_color    ForceGraph
    default_link_color    ForceGraph3D
    default_node_color    ForceGraph
    default_node_color    ForceGraph3D


*** Keywords ***
Color Feature Works As Expected
    [Arguments]    ${feature}    ${widget_class}
    ${screens} =    Set Variable    ${SCREENS}${/}${widget_class.lower()}_${feature}
    Set Screenshot Directory    ${screens}
    Set Up Color Example    ${feature}    ${widget_class}
    ${transparent} =    Get Frame Screenshot Size    ${screens}    01-transparent.png
    Add And Run JupyterLab Code Cell
    ...    fg.${feature} = "rgba(255, 0, 0, 1.0)"
    Sleep    0.5s
    ${color} =    Get Frame Screenshot Size    ${screens}    02-color.png
    Should Be True    ${color} > ${transparent}
    [Teardown]    Clean Up Color Example

Set Up Color Example
    [Arguments]    ${feature}    ${widget_class}
    Set Tags    feature:${feature}    widget:${widget_class.lower()}
    ${text} =    Get File    ${IPYFORCEGRAPH_FIXTURES}${/}api${/}Colors.py
    ${text} =    Set Variable    ${text.replace("WIDGET_CLASS", "${widget_class}")}
    ${text} =    Set Variable    ${text.replace("FEATURE", "${feature}")}
    Launch A New JupyterLab Document
    Set CodeMirror Value    .jp-CodeCell .CodeMirror    ${text.strip()}
    Execute JupyterLab Command    Show Log Console
    Execute JupyterLab Command    Run All Cells
    Wait Until Force Graph Is Visible
    Capture Page Screenshot    00-start.png

Get Frame Screenshot Size
    [Arguments]    ${screens}    ${screen}
    Run Keyword And Ignore Error
    ...    Capture Element Screenshot    css:${IPYFORCEGRAPH FRAME}    ${screen}
    ${size} =    Get File Size    ${screens}${/}${screen}
    RETURN    ${size}

Clean Up Color Example
    Capture Page Screenshot    99-fin.png
    ${nb_dir} =    Get Jupyter Directory
    Remove File    ${nb_dir}${/}Untitled.ipynb
    Refresh File List
    Try To Close All Tabs
