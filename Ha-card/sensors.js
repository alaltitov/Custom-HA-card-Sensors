import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit-element@4.0.5/+esm";

const commonStyles = css`
  :host {
    --spacing: 12px;
    --card-primary-font-weight: 500;
    --card-secondary-font-weight: 400;
    --card-primary-font-size: 14px;
    --card-secondary-font-size: 12px;
    --card-primary-line-height: 20px;
    --card-secondary-line-height: 16px;
    --card-primary-color: white;
    --card-secondary-color: white;
    --card-primary-letter-spacing: 0.1px;
    --card-secondary-letter-spacing: 0.4px;
  }

  ha-card {
    box-sizing: border-box;
    padding: var(--spacing);
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: auto; 
    cursor: pointer;
  }
  
  .container {
    display: flex;
    flex-direction: row;
    align-item: center;
    justify-content: flex-start;
  }
  
  .container > :not(:last-child) {
      margin-right: var(--spacing);
  }

  .icon {
    position: relative;
    width: 40px;
    height: 40px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .badge {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 50%;
    font-size: 0.9em; 
    transform: translate(20%, -20%);
  }

  
  .info {
    min-width: 0px;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .primary {
    font-weight: var(--card-primary-font-weight);
    font-size: var(--card-primary-font-size);
    line-height: var(--card-primary-line-height);
    color: var(--card-primary-color);
    letter-spacing: var(--card-primary-letter-spacing);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  
  .secondary {
    font-weight: var(--card-secondary-font-weight);
    font-size: var(--card-secondary-font-size);
    line-height: var(--card-secondary-line-height);
    color: var(--card-secondary-color);
    letter-spacing: var(--card-secondary-letter-spacing);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;
  
const colorMap = {
  'primary': '#03a9f4',
  'accent': '#ff9800',
  'disabled': '#464646',
  'red': '#f44336',
  'pink': '#e91e63',
  'purple': '#926bc7',
  'deep-purple': '#6e41ab',
  'indigo': '#3f51b5',
  'blue': '#2196f3',
  'light-blue': '#03a9f4',
  'cyan': '#00BCD6',
  'teal': '#009688',
  'green': '#4caf50',
  'light-green': '#8bc34a',
  'lime': '#cddc39',
  'yellow': '#ffeb3b',
  'amber': '#ffc107',
  'orange': '#ff9800',
  'deep-orange': '#ff6f22',
  'brown': '#795548',
  'light-grey': '#bdbdbd',
  'grey': '#9e9e9e',
  'dark-grey': '#606060',
  'blue-grey': '#607d8b',
  'black': '#000000',
  'white': '#ffffff'
};

class SensorCard extends LitElement {
  static get styles() {
    return [commonStyles];
  }

  static getConfigElement() {
    return document.createElement("sensor-card-editor");
  }

  static getStubConfig() {
    return { icon: 'mdi:molecule-co2', entity: "sensor.sensors_eth_scd40_co2" };
  }

  static get properties() {
    return {
      hass: Object,
      _config: Object,
    };
  }

  setConfig(config) {
    this._config = config;
    console.log('Sensor this.hass', this.hass)
  }
  
  render() {
    if (!this.hass || !this._config) {
      return html``;
    }
    
    const entityId = this._config.entity;
    const stateObj = entityId ? this.hass.states[entityId] : undefined;
    if (!stateObj) {
      return html``; // Возвращаем пустой шаблон, если объект состояния не найден
    }
    
    console.log(`Текущее состояние датчика ${entityId}:`, stateObj.state);
    
    const thresholds = this._config.numbers.trim().split(' ').map(num => parseFloat(num.trim()));
    const colorNames = this._config.colors.split(' ').map(color => color.trim());
  
    const intervalValue = parseFloat(stateObj.state);
  
    let iconColorName = '#ffffff'; // Значение по умолчанию
    for (let i = 0; i < thresholds.length; i++) {
      if (intervalValue < thresholds[0]) {
        iconColorName = colorNames[0];
        break;
      } else if (intervalValue >= thresholds[i] && (i === thresholds.length - 1 || intervalValue < thresholds[i + 1])) {
        iconColorName = colorNames[i + 1];
        break;
      }
    }
  
    // Использование colorMap для получения HEX-кода цвета
    let iconColor = colorMap[iconColorName] || '#ffffff'; // Если имя цвета не найдено, используется значение по умолчанию
    let backgroundColor = `${iconColor}4D`; // Добавление альфа-канала к цвету фона
  
    const displayName = this._config.name || stateObj.attributes.friendly_name || stateObj.entity_id;
    const unitOfMeasurement = stateObj.attributes.unit_of_measurement ? ` ${stateObj.attributes.unit_of_measurement}` : '';
  
    const borderRadius = this._config.border ? `${this._config.border}%` : '22%';
    
    const styleString = `color: ${iconColor}; background-color: ${backgroundColor}; border-radius: ${borderRadius};`;
    
    let badge = '';
    if (stateObj.state === 'unavailable') {
      badge = html`<ha-tile-badge class="badge" style="--tile-badge-background-color: #ff9800;"><ha-icon icon="mdi:help"></ha-icon></<ha-tile-badge>`;
    }
  
    return html`
      <ha-card>
        <div class="container">
          <div class="icon" style="${styleString}" @click="${this._handleClick}">
            ${this._config.icon ? html`<ha-icon icon="${this._config.icon}"></ha-icon>` : ''}
            ${badge}
          </div>
          <div class="info">
            <span class="primary">${displayName}</span>
            <span class="secondary">${stateObj.state || stateObj.entity_id}${unitOfMeasurement}</span>
          </div>
        </div>
      </ha-card>
    `;
  }

  _handleClick() {
    const entityId = this._config.entity;
    if (entityId) {
      const event = new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true });
      this.dispatchEvent(event);
    }
  }
}

customElements.define("sensor-card", SensorCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "sensor-card",
  name: "Custom Sensor Card",
  description: "Custom Sensor Card",
  preview: false,
});

class SensorCardEditor extends LitElement {

  static get properties() {
    return {
      hass: {},
      _config: {}
    };
  }
  
  setConfig(config) {
    this._config = {
      ...this._config,
      ...config
    };
    console.log('setConfig', this._config);
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }
    
    const staticSchema = [
      { name: 'entity', selector: { entity: { domain: 'sensor' } } },
      {
        type: 'expandable',
        title: 'Customize',
        icon: 'mdi:palette',
        schema: [
          {
            type: 'grid',
            name: '',
            schema: [
              { name: 'icon', selector: { icon: {} }, context: { icon_entity: "entity" } },
              { name: 'name', selector: { text: {} } },
              { name: 'example', selector: { ui_color: {} } },
              { name: 'border', selector: { number: { min: 0, max: 50, unit: '%' } } }
            ]
          },
        ]
      },
      {
        type: 'expandable',
        title: 'Conditions',
        icon: 'mdi:tune-variant',
        schema: [ 
            { name: 'numbers', selector: { template: {} } },
            { name: 'colors', selector: { template: {} } }
        ]
      },
    ];
    
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${staticSchema}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <ha-alert 
        alert-type="info"
        style="padding: 12px;">
        There must be one more color than number!
        Enter numbers and colors separated by spaces!
        Double color name separated by a dash, for example, "deep-orange"!
      </ha-alert>
    `;
  }

  _valueChanged(ev) {
    if (!ev.detail.value) {
      return;
    }
  
        this._config = {
      ...this._config,
      ...ev.detail.value
    };

  
    // Сообщаем об изменении конфигурации
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
  }

}

customElements.define("sensor-card-editor", SensorCardEditor);