import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import i18n from '../../../lib/i18n';
import { toFixed } from '../../../lib/numeric-utils';
import TipTrigger from '../../components/TipTrigger';
import SvgIcon from '../../components/SvgIcon';
import { NumberInput as Input } from '../../components/Input';

import { actions as editorActions } from '../../../flux/editor';

import styles from './styles.styl';

function convertSVGPointToLogicalPoint(p, size) {
    return {
        x: p.x - size.x,
        y: -p.y + size.y
    };
}
/**
 * Transformation section.
 *
 * This component is used for display properties of selected SVG elements.
 */
const TransformationSection = ({ headType, updateSelectedModelUniformScalingState, disabled }) => {
    const size = useSelector(state => state?.machine?.size);
    const modelGroup = useSelector(state => state[headType]?.modelGroup);
    const SVGActions = useSelector(state => state[headType]?.SVGActions);
    const transformation = modelGroup.getSelectedModelTransformation();
    let uniformScalingState = useSelector(state => state[headType]?.modelGroup?.getSelectedModelTransformation()?.uniformScalingState);
    if (uniformScalingState === undefined) {
        uniformScalingState = true;
    }
    const selectedElements = SVGActions.getSelectedElements();
    const selectedElementsTransformation = useSelector(state => state[headType]?.SVGActions?.getSelectedElementsTransformation());
    const selectedModelArray = modelGroup.getSelectedModelArray();
    const sourceType = (selectedModelArray.length === 1) ? selectedModelArray[0].sourceType : null;
    const { x, y, width, height, scaleX, scaleY, angle } = selectedElementsTransformation;

    // calculate logical transformation
    // TODO: convert positions in flux
    const { x: logicalX, y: logicalY } = convertSVGPointToLogicalPoint({ x, y }, size);
    const logicalWidth = width * Math.abs(scaleX);
    const logicalHeight = height * Math.abs(scaleY);
    const logicalAngle = -angle;
    const canResize = (sourceType !== 'text' && selectedModelArray.length === 1);
    const canRotate = (selectedModelArray.length === 1);
    const selectedNotHide = (selectedModelArray.length === 1) && selectedModelArray[0].visible || selectedModelArray.length > 1;

    const dispatch = useDispatch();

    const actions = {
        onChangeLogicalX: (newLogicalX) => {
            const elements = selectedElements;
            const newX = newLogicalX + size.x;
            dispatch(editorActions.moveElementsImmediately(headType, elements, { newX }));
        },

        onChangeLogicalY: (newLogicalY) => {
            const elements = selectedElements;
            const newY = -newLogicalY + size.y;
            dispatch(editorActions.moveElementsImmediately(headType, elements, { newY }));
        },

        onChangeWidth: (newWidth) => {
            const elements = selectedElements;

            if (elements.length === 1) {
                // TODO: save uniformScalingState in SVGModel
                if (transformation.uniformScalingState) {
                    const newHeight = height * Math.abs(scaleY) * (newWidth / width / Math.abs(scaleX));
                    dispatch(editorActions.resizeElementsImmediately(headType, elements, { newWidth, newHeight }));
                } else {
                    dispatch(editorActions.resizeElementsImmediately(headType, elements, { newWidth }));
                }
            }
        },
        onChangeHeight: (newHeight) => {
            const elements = selectedElements;

            if (elements.length === 1) {
                // TODO: save uniformScalingState in SVGModel
                if (transformation.uniformScalingState) {
                    const newWidth = width * Math.abs(scaleX) * (newHeight / height / Math.abs(scaleY));
                    dispatch(editorActions.resizeElementsImmediately(headType, elements, { newWidth, newHeight }));
                } else {
                    dispatch(editorActions.resizeElementsImmediately(headType, elements, { newHeight }));
                }
            }
        },

        onChangeLogicalAngle: (newLogicalAngle) => {
            const newAngle = -newLogicalAngle;
            const elements = selectedElements;
            dispatch(editorActions.rotateElementsImmediately(headType, elements, { newAngle }));
        },

        onFlipHorizontally: () => {
            const elements = selectedElements;
            dispatch(editorActions.flipElementsHorizontally(headType, elements));
        },

        onFlipVertically: () => {
            const elements = selectedElements;
            dispatch(editorActions.flipElementsVertically(headType, elements));
        },

        onChangeUniformScalingState: (newUniformScalingState) => {
            updateSelectedModelUniformScalingState({ uniformScalingState: newUniformScalingState });
        }
    };

    return (
        <div className="margin-vertical-8">
            <React.Fragment>
                <TipTrigger
                    title={i18n._('key-CncLaser/TransformationSection-Move')}
                    content={i18n._('key-CncLaser/TransformationSection-Set the coordinate of the selected object. You can also drag the object directly. The object should not be moved beyond work area.')}
                >
                    <div className="sm-flex height-32 margin-vertical-8 ">
                        <span className="sm-flex-auto sm-flex-order-negative width-64">{i18n._('key-CncLaser/TransformationSection-Move')}</span>
                        <span className="sm-flex-width sm-flex justify-space-between">
                            <div className="position-re sm-flex align-flex-start">
                                <span className="width-16 height-32 display-inline unit-text align-c">
                                        X
                                </span>
                                <span>
                                    <Input
                                        suffix="mm"
                                        className="margin-horizontal-2"
                                        disabled={disabled || !selectedNotHide}
                                        value={toFixed(logicalX, 1)}
                                        size="small"
                                        min={-size.x}
                                        max={size.x}
                                        onChange={(value) => {
                                            actions.onChangeLogicalX(value);
                                        }}
                                    />
                                </span>
                            </div>
                            <div className="position-re sm-flex align-flex-start">
                                <span className="width-16 height-32 display-inline unit-text align-c">
                                        Y
                                </span>
                                <span>
                                    <Input
                                        suffix="mm"
                                        disabled={disabled || !selectedNotHide}
                                        className="margin-horizontal-2"
                                        value={toFixed(logicalY, 1)}
                                        size="small"
                                        min={-size.y}
                                        max={size.y}
                                        onChange={(value) => {
                                            actions.onChangeLogicalY(value);
                                        }}
                                    />
                                </span>
                            </div>
                        </span>
                    </div>
                </TipTrigger>
                <TipTrigger
                    title={i18n._('key-CncLaser/TransformationSection-Size')}
                    content={i18n._('key-CncLaser/TransformationSection-Set the size of the selected object. You can also resize the object directly. The object should not exceed the work size.')}
                >
                    <div className="sm-flex height-32 margin-vertical-8">
                        <span className="sm-flex-auto sm-flex-order-negative width-64">{i18n._('key-CncLaser/TransformationSection-Size')}</span>
                        <div className="sm-flex-width sm-flex justify-space-between">
                            <div className="position-re sm-flex align-flex-start">
                                <span className="width-16 height-32 display-inline unit-text align-c">
                                       W
                                </span>
                                <span>
                                    <Input
                                        suffix="mm"
                                        className="margin-horizontal-2"
                                        disabled={disabled || !selectedNotHide || canResize === false}
                                        value={toFixed(logicalWidth, 1)}
                                        min={1}
                                        size="small"
                                        max={size.x}
                                        onChange={(value) => {
                                            actions.onChangeWidth(value);
                                        }}
                                    />
                                </span>
                            </div>
                            <button
                                type="button"
                                disabled={disabled || !selectedNotHide || sourceType === 'raster'}
                                className={classNames(
                                    uniformScalingState ? styles.icon_size_lock : styles.icon_size_unlock,
                                    'display-inline',
                                    // 'width-30',
                                    // 'height-30'
                                    'square-30'
                                )}
                                onClick={() => {
                                    actions.onChangeUniformScalingState(!uniformScalingState);
                                }}
                            />
                            <div className="position-re sm-flex align-flex-start">
                                <span className="width-16 height-32 display-inline unit-text align-c">
                                       H
                                </span>
                                <span>
                                    <Input
                                        suffix="mm"
                                        className="margin-horizontal-2"
                                        disabled={disabled || !selectedNotHide || canResize === false}
                                        value={toFixed(logicalHeight, 1)}
                                        min={1}
                                        max={size.y}
                                        size="small"
                                        onChange={(value) => {
                                            actions.onChangeHeight(value);
                                        }}
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                </TipTrigger>
                <TipTrigger
                    title={i18n._('key-CncLaser/TransformationSection-Rotate')}
                    content={i18n._('key-CncLaser/TransformationSection-Rotate the selected object to the angle you need.')}
                >
                    <div className="sm-flex height-32 margin-vertical-8">
                        <span className="sm-flex-auto sm-flex-order-negative width-56">{i18n._('key-CncLaser/TransformationSection-Rotate')}</span>
                        <div className="sm-flex-width sm-flex justify-space-between">
                            <div className="display-inline">
                                <SvgIcon
                                    name="RotationAngle"
                                    type={['static']}
                                />
                                <Input
                                    suffix="°"
                                    disabled={disabled || !selectedNotHide || !canRotate}
                                    value={toFixed(logicalAngle, 1)}
                                    className="margin-horizontal-2"
                                    size="small"
                                    onChange={actions.onChangeLogicalAngle}
                                />
                            </div>
                            <div className="sm-flex width-96 justify-space-between">
                                {selectedModelArray.length === 1 && (
                                    <SvgIcon
                                        name="FlipLevel"
                                        className="padding-horizontal-8 border-radius-8 border-default-grey-1"
                                        disabled={disabled || !selectedNotHide}
                                        onClick={actions.onFlipHorizontally}
                                        // type={['static']}
                                        size={26}
                                        borderRadius={8}
                                    />
                                )}
                                {selectedModelArray.length === 1 && (
                                    <SvgIcon
                                        name="FlipVertical"
                                        className="padding-horizontal-8 border-radius-8 border-default-grey-1"
                                        disabled={disabled || !selectedNotHide}
                                        onClick={actions.onFlipVertically}
                                        size={26}
                                        borderRadius={8}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </TipTrigger>
            </React.Fragment>
        </div>
    );
};

TransformationSection.propTypes = {
    headType: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    updateSelectedModelUniformScalingState: PropTypes.func.isRequired
};

export default TransformationSection;
