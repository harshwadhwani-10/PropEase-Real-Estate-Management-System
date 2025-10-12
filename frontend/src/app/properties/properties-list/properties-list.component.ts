import {
  Component,
  computed,
  input,
  model,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Property } from 'src/app/shared/interface/property';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PropertiesDisplayOption } from 'src/app/shared/enums/property';
import { PropertiesService } from '../properties.service';
import { debounce } from 'src/app/shared/utility/helpers';
import {
  filterProperties,
  searchProperties,
  sortProperties,
} from 'src/app/shared/utility/properties';

@Component({
    selector: 'app-properties-list',
    templateUrl: './properties-list.component.html',
    styleUrls: ['./properties-list.component.css'],
    standalone: false
})
export class PropertiesListComponent implements OnInit {
  @ViewChild('IonInfiniteScroll', { static: false })
  infinityScroll: IonInfiniteScroll;

  public displayOption = input<PropertiesDisplayOption>(
    PropertiesDisplayOption.CardView
  );
  public singleCol = input<boolean>(false);
  public horizontalSlide = input<boolean>(false);
  public limit = input<number>(0);
  public enableOwnedBadge = input<boolean>(false);
  public enablePopupOptions = input<boolean>(false);
  public properties = input<Property[]>();

  public disableInfinitScroll = model(false);

  public hasNoMore = computed<boolean>(() => !this.propertiesService.hasMore());
  public propertiesList = computed<Property[]>(() => {
    if (!this.properties()) {
      return [];
    }
    let temp = this.limit()
      ? this.properties().slice(0, this.limit())
      : this.properties();

    const { sort, search, filter } = this.queryParams();
    if (search) temp = searchProperties(search, temp);
    if (filter) temp = filterProperties(filter, temp);

    temp = sortProperties(sort || 'latest', temp);
    return temp;
  });

  private queryParams = toSignal(this.activatedRoute.queryParams);

  constructor(
    private activatedRoute: ActivatedRoute,
    private propertiesService: PropertiesService
  ) {}

  ngOnInit(): void {
    // Only load properties if none exist and not currently loading
    if (!this.propertiesService.properties.length && !this.propertiesService.isLoading()) {
      this.getPropertiesList();
    }
  }

  public loadMoreProperty = debounce(async () => {
    console.log('load more...');

    const { hasMore } = await this.getPropertiesList();
    // if (!hasMore) {
    //   this.disableInfinitScroll.set(true);
    // }
    await this.infinityScroll.complete();
    this.propertiesService.hasMore.set(hasMore);
  }, 1000);

  private async getPropertiesList(): Promise<{ hasMore: boolean }> {
    // Prevent multiple simultaneous calls
    if (this.propertiesService.isLoading()) {
      return { hasMore: false };
    }
    
    this.propertiesService.isLoading.set(true);
    
    try {
      const { sort, filter, search } = this.queryParams();
      const res = await this.propertiesService.fetchProperties(
        sort,
        filter,
        search
      );
      
      // Check if response has data property (successful response)
      if (!res.data) {
        console.error('No data in response:', res);
        return { hasMore: false };
      }
      
      const { items, hasMore, ...lastFetched } = res.data;
      // Check if this is the first load (no existing properties)
      const isFirstLoad = this.propertiesService.properties.length === 0;
      this.propertiesService.setPropertiesState(items, lastFetched, isFirstLoad);
      return { hasMore };
    } finally {
      this.propertiesService.isLoading.set(false);
    }
  }
}
