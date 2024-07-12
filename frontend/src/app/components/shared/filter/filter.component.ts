import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ServiceService } from '../../../core/services/service/service.service';
import { ActivityService } from '../../../core/services/activity/activity.service';
import { Filter } from '../../../core/models/filter.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Service } from '../../../core/models/service.model';
import { Activity } from '../../../core/models/activity.model';
import { MatTooltipModule } from '@angular/material/tooltip';

interface ActivityForFilter {
  id: number | null;
  name: string;
}

interface IndicatorForFilter {
  id: number;
  name: string;
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule]
})
export class FilterComponent implements OnInit, OnChanges {

  servicesList: Service[] = [];
  activitiesList: ActivityForFilter[] = [];
  indicatorsList: IndicatorForFilter[] = [];
  activityCache = new Map<number, Activity>();

  @Input() selectedServiceId?: number | string = 0;
  @Input() selectedActivityId?: number | undefined = undefined;
  @Input() selectedIndicatorId?: number = undefined;
  @Input() showMonthInput: boolean = true;
  @Input() indicatorsInput: boolean = false;
  @Input() dataInsertedCheckbox: boolean = false;
  @Input() showServiceInput: boolean = true;
  @Input() showActivityInput: boolean = false;

  @Output() filterEvent = new EventEmitter<Filter>();
  @Output() activityInputChange = new EventEmitter<boolean>();

  filter: Filter = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };

  constructor(private serviceService: ServiceService, private activityService: ActivityService) { }

  ngOnInit() {
    this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedServiceId'] && changes['selectedServiceId'].currentValue) {
      this.updateActivityAndIndicatorSelections(Number(changes['selectedServiceId'].currentValue));
    }
  }

  loadInitialData() {
    this.serviceService.indexServices().subscribe(services => {
      this.servicesList = services;
      if (this.selectedServiceId) {
        this.updateActivityAndIndicatorSelections(Number(this.selectedServiceId));
      }
    });

    this.activityService.indexActivities().subscribe(activities => {
      this.activitiesList = activities.map(activity => ({
        id: activity.id,
        name: activity.activity_name
      }));
    });
  }

  onServiceSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const serviceId = Number(target.value);
    if (!isNaN(serviceId)) {
      this.selectedServiceId = serviceId;
      this.updateActivityAndIndicatorSelections(serviceId);
    }
  }

  updateActivityAndIndicatorSelections(serviceId: number) {
    const selectedService = this.servicesList.find(service => service.id === serviceId);
    if (selectedService) {
      const hasActivities = selectedService.activities && selectedService.activities.length > 0;
      this.activityInputChange.emit(hasActivities);
      this.activitiesList = selectedService.activities?.map(activity => ({
        id: activity.id,
        name: activity.name
      })) || [];

      if (this.activitiesList.length === 0) {
        this.indicatorsList = selectedService.indicators?.map(indicator => ({
          id: indicator.id,
          name: indicator.name
        })) || [];
      } else {
        this.indicatorsList = [];
      }
    }
  }

  onActivitySelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const activityId = target.value === 'null' ? undefined : Number(target.value);
    this.selectedActivityId = activityId !== undefined && !isNaN(activityId) ? activityId : undefined;
    if (activityId) {
      if (this.activityCache.has(activityId)) {
        const cachedActivity = this.activityCache.get(activityId);
        if (cachedActivity) {
          this.updateIndicatorSelection(cachedActivity);
        }
      } else {
        this.activityService.showActivity(activityId).subscribe(activity => {
          this.activityCache.set(activityId, activity);
          this.updateIndicatorSelection(activity);
        });
      }
    } else {
      this.updateIndicatorSelection(undefined);
    }
  }

  updateIndicatorSelection(activity: Activity | undefined) {
    if (activity) {
      this.indicatorsList = activity.sais?.map(sai => ({
        id: sai.indicator.id,
        name: sai.indicator.indicator_name
      }))
        .filter((value, index, self) => self.findIndex(v => v.id === value.id) === index) || [];
    } else {
      const selectedService = this.servicesList.find(service => service.id === this.selectedServiceId);
      this.indicatorsList = selectedService?.indicators?.map(indicator => ({
        id: indicator.id,
        name: indicator.name
      })) || [];
    }
    this.selectedIndicatorId = undefined;
  }

  resetSelections() {
    this.selectedServiceId = undefined;
    this.selectedActivityId = undefined;
    this.selectedIndicatorId = undefined;
    this.activitiesList = [];
    this.indicatorsList = [];
  }

  sendFilter() {
    this.filterEvent.emit({
      serviceId: this.selectedServiceId,
      activityId: this.selectedActivityId !== undefined ? this.selectedActivityId : undefined,
      indicatorId: this.selectedIndicatorId,
      month: this.showMonthInput ? this.filter.month : undefined,
      year: this.filter.year
    });
  }

  trackByServiceId(index: number, service: any): number {
    return service.id;
  }
}