<script lang="ts">
  import { currentProject, settings } from '../stores/project';
  import { formatDimension, parseDimension } from '../utils/units';
  import type { UnitSystem, OptimizationPriority } from '../types';
  
  let kerfInput = $state(formatDimension($settings.sawKerf, $settings.unitSystem));
  let marginInput = $state(formatDimension($settings.edgeMargin, $settings.unitSystem));
  
  function updateUnitSystem(unitSystem: UnitSystem) {
    currentProject.updateSettings({ unitSystem });
    kerfInput = formatDimension($settings.sawKerf, unitSystem);
    marginInput = formatDimension($settings.edgeMargin, unitSystem);
  }
  
  function updateKerf() {
    const kerf = parseDimension(kerfInput, $settings.unitSystem);
    if (kerf !== null && kerf > 0) {
      currentProject.updateSettings({ sawKerf: kerf });
    }
  }
  
  function updateMargin() {
    const margin = parseDimension(marginInput, $settings.unitSystem);
    if (margin !== null && margin >= 0) {
      currentProject.updateSettings({ edgeMargin: margin });
    }
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-semibold mb-4">Settings</h2>
  
  <div class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Unit System
      </label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="unitSystem"
            value="imperial"
            checked={$settings.unitSystem === 'imperial'}
            onchange={() => updateUnitSystem('imperial')}
            class="text-blue-600"
          />
          <span>Imperial (inches)</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="unitSystem"
            value="metric"
            checked={$settings.unitSystem === 'metric'}
            onchange={() => updateUnitSystem('metric')}
            class="text-blue-600"
          />
          <span>Metric (mm)</span>
        </label>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Saw Kerf ({$settings.unitSystem === 'imperial' ? 'inches' : 'mm'})
        </label>
        <input
          type="text"
          bind:value={kerfInput}
          onchange={updateKerf}
          placeholder={$settings.unitSystem === 'imperial' ? '1/8' : '3'}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p class="text-xs text-gray-500 mt-1">Width of the saw blade cut</p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Edge Margin ({$settings.unitSystem === 'imperial' ? 'inches' : 'mm'})
        </label>
        <input
          type="text"
          bind:value={marginInput}
          onchange={updateMargin}
          placeholder={$settings.unitSystem === 'imperial' ? '1/4' : '6'}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p class="text-xs text-gray-500 mt-1">Margin from sheet edges</p>
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Optimization Priority
      </label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="optimization"
            value="minimizeSheets"
            checked={$settings.optimizationPriority === 'minimizeSheets'}
            onchange={() => currentProject.updateSettings({ optimizationPriority: 'minimizeSheets' })}
            class="text-blue-600"
          />
          <span>Minimize Sheet Count</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="optimization"
            value="minimizeWaste"
            checked={$settings.optimizationPriority === 'minimizeWaste'}
            onchange={() => currentProject.updateSettings({ optimizationPriority: 'minimizeWaste' })}
            class="text-blue-600"
          />
          <span>Minimize Waste</span>
        </label>
      </div>
    </div>
    
    <div>
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={$settings.allowRotation}
          onchange={(e) => currentProject.updateSettings({ allowRotation: e.currentTarget.checked })}
          class="text-blue-600 w-4 h-4"
        />
        <span class="text-sm font-medium text-gray-700">Allow piece rotation (unless grain direction is specified)</span>
      </label>
    </div>
  </div>
</div>
