/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import newId from '../utils/newId';
import styles from './asInput.scss';
import InvalidMessage from '../InvalidMessage';
import Variant from '../utils/constants';

export const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component';

export const inputProps = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dangerIconDescription: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  validator: PropTypes.func,
  isValid: PropTypes.bool,
  invalidMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  className: PropTypes.arrayOf(PropTypes.string),
  themes: PropTypes.arrayOf(PropTypes.string),
  inline: PropTypes.bool,
  inputGroupPrepend: PropTypes.element,
  inputGroupAppend: PropTypes.element,
};

export const defaultProps = {
  onChange: () => {},
  onBlur: () => {},
  id: undefined,
  value: '',
  dangerIconDescription: '',
  description: undefined,
  disabled: false,
  required: false,
  validator: undefined,
  isValid: true,
  invalidMessage: '',
  className: [],
  themes: [],
  inline: false,
  inputGroupPrepend: undefined,
  inputGroupAppend: undefined,
};

const asInput = (WrappedComponent, inputType = undefined, labelFirst = true) => {
  class NewComponent extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.handleBlur = this.handleBlur.bind(this);
      this.renderInput = this.renderInput.bind(this);

      const id = this.props.id ? this.props.id : newId('asInput');
      const isValid = this.props.validator ? true : this.props.isValid;
      const invalidMessage = this.props.validator ? '' : this.props.invalidMessage;
      const dangerIconDescription = this.props.validator ? '' : this.props.dangerIconDescription;
      this.state = {
        id,
        value: this.props.value,
        isValid,
        invalidMessage,
        dangerIconDescription,
        describedBy: [],
        errorId: `error-${id}`,
        descriptionId: `description-${id}`,
      };
    }

    componentWillReceiveProps(nextProps) {
      const updatedState = {};
      if (nextProps.value !== this.props.value) {
        updatedState.value = nextProps.value;
      }
      if (nextProps.isValid !== this.props.isValid && !nextProps.validator) {
        updatedState.isValid = nextProps.isValid;
      }
      if (nextProps.invalidMessage !== this.props.invalidMessage && !nextProps.validator) {
        updatedState.invalidMessage = nextProps.invalidMessage;
      }
      if (nextProps.dangerIconDescription !== this.props.dangerIconDescription &&
          !nextProps.validator) {
        updatedState.dangerIconDescription = nextProps.dangerIconDescription;
      }
      // If validator goes away, revert to props
      if (nextProps.validator !== this.props.validator && !nextProps.validator) {
        updatedState.isValid = nextProps.isValid;
        updatedState.invalidMessage = nextProps.invalidMessage;
        updatedState.dangerIconDescription = nextProps.dangerIconDescription;
      }
      if (Object.keys(updatedState).length > 0) {
        this.setState(updatedState);
      }
    }

    getDescriptions() {
      // possible future work: multiple feedback msgs?
      const errorId = `error-${this.state.id}`;
      const descriptionId = `description-${this.state.id}`;
      const desc = {};

      // TODO: refactor this component to use Variants instead of the themes array.
      desc.error = (
        <InvalidMessage
          id={errorId}
          isValid={this.state.isValid}
          invalidMessage={this.state.invalidMessage}
          variant={{
            status: this.hasDangerTheme() ? Variant.status.DANGER : Variant.status.INFO,
          }}
          variantIconDescription={this.state.dangerIconDescription}
        />
      );
      desc.describedBy = errorId;

      if (this.props.description) {
        desc.description = (
          <small className={styles['form-text']} id={descriptionId} key="1">
            {this.props.description}
          </small>
        );
        desc.describedBy = `${desc.describedBy} ${descriptionId}`.trim();
      }

      return desc;
    }

    getLabel() {
      return (
        // eslint-disable-next-line jsx-a11y/label-has-for
        <label
          id={`label-${this.state.id}`}
          htmlFor={this.state.id}
          className={[classNames({
            [styles['form-check-label']]: this.isGroupedInput(),
          })]}
        >
          {this.props.label}
        </label>
      );
    }

    hasDangerTheme() {
      return this.props.themes.indexOf('danger') >= 0;
    }

    isGroupedInput() {
      switch (inputType) {
        case 'checkbox':
          return true;
        default:
          return false;
      }
    }

    handleBlur(event) {
      const val = event.target.value;

      if (this.props.validator) {
        this.setState(this.props.validator(val));
      }
      this.props.onBlur(val, this.props.name);
    }

    handleChange(event) {
      this.setState({ value: event.target.value });
      this.props.onChange(
        event.target.type === 'checkbox' ? event.target.checked : event.target.value,
        this.props.name,
      );
    }

    renderInput(describedBy) {
      const { className } = this.props;

      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          className={[classNames(
            {
              [styles['form-control']]: !this.isGroupedInput(),
              [styles['form-check-input']]: this.isGroupedInput(),
              [styles['is-invalid']]: !this.state.isValid,
              [styles['is-invalid-nodanger']]: !this.hasDangerTheme(),
            },
            className,
          ).trim()]}
          describedBy={describedBy}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
      );
    }

    render() {
      const { description, error, describedBy } = this.getDescriptions();
      return (
        <div className={[classNames({
            [styles['form-group']]: !this.isGroupedInput(),
            [styles['form-inline']]: !this.isGroupedInput() && this.props.inline,
            [styles['form-check']]: this.isGroupedInput(),
          })]}
        >
          {labelFirst && this.getLabel()}
          {this.props.inputGroupPrepend || this.props.inputGroupAppend ? (
            <div className={styles['input-group']}>
              <div className={styles['input-group-prepend']}>
                {this.props.inputGroupPrepend}
              </div>
              {this.renderInput(describedBy)}
              <div className={styles['input-group-append']}>
                {this.props.inputGroupAppend}
              </div>
            </div>
          ) : this.renderInput(describedBy)}
          {!labelFirst && this.getLabel()}
          {error}
          {description}
        </div>
      );
    }
  }

  NewComponent.displayName = `asInput(${getDisplayName(WrappedComponent)})`;

  NewComponent.propTypes = inputProps;

  NewComponent.defaultProps = defaultProps;

  return NewComponent;
};

export default asInput;
