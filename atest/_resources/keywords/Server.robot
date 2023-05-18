*** Settings ***
Library     OperatingSystem
Library     Process
Library     String
Library     Collections
Resource    Lab.robot
Resource    Browser.robot
Resource    Meta.robot
Resource    ../variables/Server.robot


*** Variables ***
${JUPYTERLAB_EXE}       jupyter-lab


*** Keywords ***
Setup Server and Browser
    [Documentation]    Custom invocation of jupyter-server
    ${notebook_dir} =    Initialize Jupyter Directory
    ${lab} =    Initialize Jupyter Server    ${notebook_dir}
    Open JupyterLab
    Set Window Size    1920    1080

Tear Down Everything
    Close All Browsers
    Run Keyword and Ignore Error    Terminate All Jupyter Servers

Initialize Jupyter Directory
    [Documentation]    Configure the settings directory, and modify settings that make tests less reproducible
    ${nb_dir} =    Set Variable    ${OUTPUT_DIR}${/}nb
    ${etc} =    Set Variable    ${nb_dir}${/}.etc
    Create Directory    ${etc}
    Copy File    ${IPYFORCEGRAPH_FIXTURES}${/}${NBSERVER CONF}    ${etc}${/}${NBSERVER CONF}
    Set Environment Variable    JUPYTER_CONFIG_DIR    ${etc}
    ${settings} =    Set Variable    ${etc}${/}lab${/}user-settings
    Create File
    ...    ${settings}${/}@jupyterlab${/}codemirror-extension${/}commands.jupyterlab-settings
    ...    {"styleActiveLine": true}
    Create File
    ...    ${settings}${/}@jupyterlab${/}extensionmanager-extension${/}plugin.jupyterlab-settings
    ...    {"enabled": false}
    Create File
    ...    ${settings}${/}@jupyterlab${/}apputils-extension${/}palette.jupyterlab-settings
    ...    {"modal": false}
    Create File
    ...    ${settings}${/}@jupyterlab${/}apputils-extension${/}notification.jupyterlab-settings
    ...    {"checkForUpdates": false, "doNotDisturbMode": true, "fetchNews": "false"}
    RETURN    ${nb_dir}

Initialize Jupyter Server
    [Documentation]    Set up server with command as defined in atest.py.
    [Arguments]    ${notebook_dir}
    ${port} =    Get Unused Port
    ${token} =    Generate Random String    64
    ${base url} =    Set Variable    /ipy@rf@g/
    @{args} =    Build Custom JupyterLab Args    ${port}    ${token}    ${base url}
    ${rest_args} =    Get Slice From List    ${args}    1
    &{config} =    Create Dictionary
    ...    stdout=${OUTPUT DIR}${/}lab.log
    ...    stderr=STDOUT
    ...    cwd=${notebook_dir}
    ${lab} =    Start New Jupyter Server
    ...    ${args[0]}
    ...    ${port}
    ...    ${base url}
    ...    ${notebook dir}
    ...    ${token}
    ...    @{rest_args}
    ...    &{config}
    Wait For Jupyter Server To Be Ready    ${lab}
    RETURN    ${lab}

Build Custom JupyterLab Args
    [Documentation]    Generate some args
    [Arguments]    ${port}    ${token}    ${base url}
    ${args} =    Loads    ${JUPYTERLAB_EXE}
    @{args} =    Set Variable
    ...    @{args}
    ...    --no-browser
    ...    --debug
    ...    --expose-app-in-browser
    ...    --port\=${port}
    ...    --ServerApp.token\=${token}
    ...    --ServerApp.base_url\=${base url}
    Log    ${args}
    RETURN    @{args}
