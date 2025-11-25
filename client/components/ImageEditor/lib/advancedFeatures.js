/**
 * Advanced Fabric.js Features
 */
(function () {
  'use strict';

  var advancedFeatures = function (canvas) {
    const _self = this;

    // Add Filters Panel
    this.initializeFilters = function() {
      const filtersHTML = `
        <div class="advanced-panel filters-panel" style="display:none;">
          <h3>Image Filters</h3>
          <button class="filter-btn" data-filter="grayscale">Grayscale</button>
          <button class="filter-btn" data-filter="sepia">Sepia</button>
          <button class="filter-btn" data-filter="invert">Invert</button>
          <button class="filter-btn" data-filter="brightness">Brightness</button>
          <button class="filter-btn" data-filter="contrast">Contrast</button>
          <button class="filter-btn" data-filter="blur">Blur</button>
          <button class="filter-btn" data-filter="remove">Remove Filters</button>
          
          <div class="filter-controls" style="display:none; margin-top:16px;">
            <label id="filter-label">Brightness</label>
            <input type="range" id="filter-slider" min="-1" max="1" step="0.1" value="0">
            <span id="filter-value">0</span>
          </div>
        </div>
      `;
      
      $(`${this.containerSelector}`).append(filtersHTML);
      
      // Filter button handlers
      $(`${this.containerSelector} .filter-btn`).click(function() {
        const filterType = $(this).data('filter');
        const activeObj = canvas.getActiveObject();
        
        if (!activeObj || activeObj.type !== 'image') {
          alert('Please select an image first');
          return;
        }
        
        if (filterType === 'remove') {
          activeObj.filters = [];
          activeObj.applyFilters();
          canvas.renderAll();
          $(`${_self.containerSelector} .filter-controls`).hide();
          return;
        }
        
        if (filterType === 'grayscale') {
          activeObj.filters.push(new fabric.Image.filters.Grayscale());
          activeObj.applyFilters();
          canvas.renderAll();
        } else if (filterType === 'sepia') {
          activeObj.filters.push(new fabric.Image.filters.Sepia());
          activeObj.applyFilters();
          canvas.renderAll();
        } else if (filterType === 'invert') {
          activeObj.filters.push(new fabric.Image.filters.Invert());
          activeObj.applyFilters();
          canvas.renderAll();
        } else if (filterType === 'brightness' || filterType === 'contrast' || filterType === 'blur') {
          $(`${_self.containerSelector} .filter-controls`).show();
          $(`${_self.containerSelector} #filter-label`).text(filterType.charAt(0).toUpperCase() + filterType.slice(1));
          
          const slider = $(`${_self.containerSelector} #filter-slider`);
          slider.off('input').on('input', function() {
            const value = parseFloat($(this).val());
            $(`${_self.containerSelector} #filter-value`).text(value);
            
            activeObj.filters = activeObj.filters.filter(f => 
              !(f instanceof fabric.Image.filters.Brightness) &&
              !(f instanceof fabric.Image.filters.Contrast) &&
              !(f instanceof fabric.Image.filters.Blur)
            );
            
            if (filterType === 'brightness') {
              activeObj.filters.push(new fabric.Image.filters.Brightness({ brightness: value }));
            } else if (filterType === 'contrast') {
              activeObj.filters.push(new fabric.Image.filters.Contrast({ contrast: value }));
            } else if (filterType === 'blur') {
              activeObj.filters.push(new fabric.Image.filters.Blur({ blur: Math.abs(value) }));
            }
            
            activeObj.applyFilters();
            canvas.renderAll();
          });
        }
      });
    };

    // Add Crop Tool
    this.initializeCrop = function() {
      let cropRect = null;
      
      this.startCrop = function() {
        const activeObj = canvas.getActiveObject();
        if (!activeObj || activeObj.type !== 'image') {
          alert('Please select an image to crop');
          return;
        }
        
        canvas.discardActiveObject();
        
        cropRect = new fabric.Rect({
          left: activeObj.left,
          top: activeObj.top,
          width: activeObj.width * activeObj.scaleX / 2,
          height: activeObj.height * activeObj.scaleY / 2,
          fill: 'rgba(0,0,0,0.3)',
          stroke: '#00ff00',
          strokeWidth: 2,
          selectable: true,
          hasRotatingPoint: false
        });
        
        canvas.add(cropRect);
        canvas.setActiveObject(cropRect);
        canvas.renderAll();
        
        $(`${this.containerSelector}`).append(`
          <div class="crop-controls">
            <button id="apply-crop">Apply Crop</button>
            <button id="cancel-crop">Cancel</button>
          </div>
        `);
        
        $(`${this.containerSelector} #apply-crop`).click(() => {
          this.applyCrop(activeObj, cropRect);
        });
        
        $(`${this.containerSelector} #cancel-crop`).click(() => {
          canvas.remove(cropRect);
          cropRect = null;
          $(`${this.containerSelector} .crop-controls`).remove();
          canvas.renderAll();
        });
      };
      
      this.applyCrop = function(img, rect) {
        const scaleX = img.scaleX;
        const scaleY = img.scaleY;
        
        const cropX = (rect.left - img.left) / scaleX;
        const cropY = (rect.top - img.top) / scaleY;
        const cropWidth = rect.width * rect.scaleX / scaleX;
        const cropHeight = rect.height * rect.scaleY / scaleY;
        
        img.set({
          cropX: cropX,
          cropY: cropY,
          width: cropWidth,
          height: cropHeight
        });
        
        canvas.remove(rect);
        cropRect = null;
        $(`${this.containerSelector} .crop-controls`).remove();
        canvas.renderAll();
      };
    };



    // Add Advanced Toolbar Buttons
    this.addAdvancedButtons = function() {
      const advancedButtonsHTML = `
        <button id="filters-toggle" title="Filters">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z"/>
            <path d="M10 12l2.5 3 3.5-4.5 4.5 6H8z"/>
          </svg>
        </button>
        <button id="crop-toggle" title="Crop">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z"/>
          </svg>
        </button>
      `;
      
      $(`${this.containerSelector} #toolbar .extended-buttons`).prepend(advancedButtonsHTML);
      
      $(`${this.containerSelector} #filters-toggle`).click(() => {
        $(`${this.containerSelector} .filters-panel`).toggle();
      });
      
      $(`${this.containerSelector} #crop-toggle`).click(() => {
        this.startCrop();
      });
    };

    // Initialize all features
    this.initializeFilters();
    this.initializeCrop();
    this.addAdvancedButtons();
  };

  window.ImageEditor.prototype.initializeAdvancedFeatures = advancedFeatures;
})();
